import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { createScreenPainter, type ScreenPainter } from "./lock-screen-painter";
import { createStickers } from "./stickers";
import { SKY_TRANSITION_MS } from "./sky-transition";

const MODEL = "/assets/macbook-pro-14-inch-m5/source/macbook_pro_14_inch_M5.glb";
const smooth = (n: number) => { const t = THREE.MathUtils.clamp(n, 0, 1); return t * t * (3 - 2 * t); };
interface Callbacks { onReady: () => void; onActive: (active: boolean) => void; onError: () => void }

export function createMacBookRenderer(host: HTMLDivElement, track: HTMLElement, callbacks: Callbacks) {
  let disposed = false;
  let frame = 0;
  let ready = false;
  let assetsReady = false;
  let revealed = false;
  let lastActive = false;
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, stencil: true }); }
  catch { callbacks.onError(); return () => {}; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  RectAreaLightUniformsLib.init();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .01, 100);
  const stickers = createStickers(camera);
  let capturedPointer: number | null = null;
  let stickerClick = false;
  const pmrem = new THREE.PMREMGenerator(renderer);
  // Broad, continuous softboxes replace the room's small bright reflection patches.
  const lightMap = document.createElement('canvas');
  lightMap.width = 1024; lightMap.height = 512;
  const ctx = lightMap.getContext('2d')!;
  ctx.fillStyle = '#343943'; ctx.fillRect(0, 0, 1024, 512);
  const softbox = (x: number, y: number, radius: number, color: string) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color); gradient.addColorStop(.35, color);
    gradient.addColorStop(1, '#34394300');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1024, 512);
  };
  softbox(280, 120, 330, '#d8dce3');
  softbox(800, 210, 250, '#737f94');
  const lightTexture = new THREE.CanvasTexture(lightMap);
  lightTexture.colorSpace = THREE.SRGBColorSpace;
  lightTexture.mapping = THREE.EquirectangularReflectionMapping;
  const environment = pmrem.fromEquirectangular(lightTexture);
  scene.environment = environment.texture;
  scene.environmentIntensity = 1.35;
  lightTexture.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xdfe6f3, 0x424754, .55));
  // Calibrated against the original shell vertices: closed lid and base share
  // the same front/back extent. The earlier approximate axis offset the lid by 3.5 mm.
  const pivot = new THREE.Group(); pivot.position.set(0, -.0004, -1.0703); scene.add(pivot);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const screenCenter = new THREE.Vector3(0, 1.053, -1.513).sub(pivot.position).applyAxisAngle(new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(-25)).add(pivot.position);
  const screenNormal = new THREE.Vector3(0, Math.SQRT1_2, Math.SQRT1_2);
  // The display itself lights the keyboard and chassis as the lid opens.
  const glow = new THREE.RectAreaLight(0xffffff, 0, 3.0, 1.95);
  pivot.rotation.x = THREE.MathUtils.degToRad(-25); pivot.updateMatrixWorld(true);
  glow.position.copy(screenCenter).addScaledVector(screenNormal, .03);
  glow.lookAt(screenCenter.clone().add(screenNormal));
  pivot.attach(glow); pivot.rotation.x = 0;
  const resources = new Set<THREE.Texture>();
  let painter: ScreenPainter | null = null;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const setRay = (event: MouseEvent) => {
    const rect = host.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
  };
  // The sky controls are visually behind WebGL. Forward only unoccluded sky
  // clicks, so the transparent canvas does not block them or make the sun
  // clickable through the laptop when the lid covers it.
  const celestialAt = (event: MouseEvent): HTMLButtonElement | null => {
    const button = track.querySelector<HTMLButtonElement>(".mb-celestial-body:not(:disabled)");
    if (!button || button.getAttribute("aria-disabled") === "true") return null;
    const rect = button.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return null;
    setRay(event);
    const obscured = raycaster.intersectObjects(scene.children, true).some(hit => {
      for (let object: THREE.Object3D | null = hit.object; object; object = object.parent) if (!object.visible) return false;
      return true;
    });
    return obscured ? null : button;
  };
  // Preserve sticker and celestial interactions without treating the display as a lock screen.
  const click = (event: MouseEvent) => {
    if (stickerClick || stickers.consumeDrag()) { stickerClick = false; return; }
    const celestial = celestialAt(event);
    if (celestial) { celestial.click(); return; }
  };
  const hover = (event: PointerEvent) => {
    if (capturedPointer !== null && capturedPointer !== event.pointerId) return;
    setRay(event);
    if (stickers.busy) stickers.move(raycaster);
    const over = stickers.hover(raycaster);
    const overCelestial = !stickers.busy && celestialAt(event);
    host.style.cursor = stickers.busy ? "grabbing" : over ? "grab" : overCelestial ? "pointer" : "";
    schedule();
  };
  const down = (event: PointerEvent) => {
    if (event.button !== 0 || capturedPointer !== null) return;
    stickerClick = false; stickers.consumeDrag(); setRay(event);
    if (!stickers.down(raycaster)) return;
    stickerClick = true; capturedPointer = event.pointerId;
    renderer.domElement.setPointerCapture(event.pointerId);
    host.style.cursor = "grabbing"; schedule();
  };
  const up = (event: PointerEvent) => {
    if (capturedPointer !== event.pointerId) return;
    capturedPointer = null; stickers.up(); stickers.leave();
    if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
    host.style.cursor = ""; schedule();
  };
  const leave = () => { stickers.leave(); if (!stickers.busy) host.style.cursor = ""; schedule(); };
  const touchStart = (event: TouchEvent) => { if (stickers.busy) event.preventDefault(); };
  const update = () => {
    frame = 0;
    if (disposed) return;
    const width = host.clientWidth, height = host.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix();
    // Shift the framing down without changing the model, opening arc or hit testing.
    camera.setViewOffset(width, height, 0, -Math.min(32, height * .035), width, height);
    const p = reduced.matches ? 1 : THREE.MathUtils.clamp(-track.getBoundingClientRect().top / Math.max(1, track.offsetHeight - height), 0, 1);
    const opening = smooth(p);
    pivot.rotation.x = THREE.MathUtils.degToRad(110 - 135 * opening);
    glow.intensity = opening * (painter && !painter.locked ? 26 : 20);
    const fit = Math.max(1, 1.6 / camera.aspect);
    const start = new THREE.Vector3(0, 4.1 * fit, .12);
    const look = new THREE.Vector3(0, .95 * opening, -.4 * opening);
    // End perpendicular to the screen, retaining a border around the display.
    const endDistance = Math.max(3.0 / (camera.aspect * .76), 1.95 / .72) / (2 * Math.tan(THREE.MathUtils.degToRad(17.5))) * .86;
    const end = screenCenter.clone().addScaledVector(screenNormal, endDistance);
    // One centered arc: the camera leaves the lid from above and reaches the
    // screen-normal endpoint exactly as the display finishes opening.
    camera.position.copy(start).lerp(end, opening);
    look.lerp(screenCenter, opening);
    camera.lookAt(look);
    track.style.setProperty("--hint-opacity", `${1 - smooth(p / .12)}`);
    const active = ready && p > .995;
    track.dataset.active = String(active);
    if (active !== lastActive) { lastActive = active; callbacks.onActive(active); }
    const animating = stickers.animate(performance.now());
    const themeAnimating = updateTheme(performance.now());
    renderer.render(scene, camera);
    if (ready && assetsReady && !revealed) {
      revealed = true;
      callbacks.onReady();
    }
    if (animating || themeAnimating) schedule();
  };
  const schedule = () => { if (!frame && !disposed) frame = requestAnimationFrame(update); };
  // Asset-specific aluminium materials: shell, underside and trackpad. Keys,
  // keyboard well, display bezel and Apple logo retain their original finish.
  const aluminiumNames = new Set(["zNRfbdNyoCOxSDD", "HdeQgqDhVRltuvQ", "MTVWTmEddByGzeA", "GzMrvkTsmRxvOJz", "XvtJEVWVvyDeJRR", "WiyOPYJEeiHNVjF"]);
  const aluminium = new Map<THREE.MeshStandardMaterial, THREE.Color>();
  const silver = new THREE.Color("#e1e3e5");
  let daylight = document.documentElement.classList.contains("dark") ? 0 : 1;
  let fromDaylight = daylight, targetDaylight = daylight;
  let themeStart: number | null = null;
  const updateTheme = (now: number) => {
    if (themeStart !== null) {
      const progress = reduced.matches ? 1 : Math.min(1, (now - themeStart) / SKY_TRANSITION_MS);
      daylight = THREE.MathUtils.lerp(fromDaylight, targetDaylight, smooth(progress));
      if (progress === 1) themeStart = null;
    }
    scene.environmentIntensity = THREE.MathUtils.lerp(1.35, 2.1, daylight);
    for (const [material, original] of aluminium) material.color.copy(original).lerp(silver, daylight);
    return themeStart !== null;
  };
  const applyTheme = () => {
    const now = performance.now();
    updateTheme(now);
    const next = document.documentElement.classList.contains("dark") ? 0 : 1;
    if (next !== targetDaylight) {
      fromDaylight = daylight;
      targetDaylight = next;
      themeStart = now;
    }
    schedule();
  };
  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  const loader = new GLTFLoader();
  loader.load(MODEL, (gltf) => {
    if (disposed) { disposeModel(gltf.scene); return; }
    const model = gltf.scene;
    model.scale.setScalar(10); scene.add(model); model.updateMatrixWorld(true);
    // Original GLB's upper assembly; all lid components retain their original materials.
    const lid = model.getObjectByName("RcexTyyhpuJYATQ");
    if (!lid) { callbacks.onError(); disposeModel(model); scene.remove(model); return; }
    pivot.rotation.x = 0;
    pivot.updateMatrixWorld(true);
    pivot.attach(lid);
    // Only the actual lid shell writes the shadow receiver mask. Clone its
    // material because the source asset shares this finish with the base.
    const shell = lid.getObjectByName("KjpcUkkMjGYeXkV");
    if (shell instanceof THREE.Mesh) {
      const receiver = (source: THREE.Material) => {
        const material = source.clone();
        material.stencilWrite = true;
        material.stencilRef = 1;
        material.stencilFunc = THREE.AlwaysStencilFunc;
        material.stencilZPass = THREE.ReplaceStencilOp;
        return material;
      };
      shell.material = Array.isArray(shell.material) ? shell.material.map(receiver) : receiver(shell.material);
    }
    // Position the sticker plane on the closed aluminium shell, then attach it
    // to the hinge so it follows precisely the same opening rotation as the lid.
    pivot.rotation.x = THREE.MathUtils.degToRad(110);
    pivot.updateMatrixWorld(true);
    stickers.group.position.set(0, .096, 0);
    scene.add(stickers.group); pivot.attach(stickers.group);
    void stickers.load().then(() => {
      if (disposed) return;
      assetsReady = true;
      schedule();
    }).catch(() => { if (!disposed) callbacks.onError(); });
    pivot.rotation.x = 0;
    // Retain source texture detail while giving aluminium a wider, softer highlight.
    const softened = new Set<THREE.Material>();
    const soften = (object: THREE.Object3D) => {
      if (!(object instanceof THREE.Mesh)) return;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (!(material instanceof THREE.MeshStandardMaterial) || softened.has(material)) continue;
        softened.add(material);
        if (aluminiumNames.has(material.name)) aluminium.set(material, material.color.clone());
        if (material.metalness > .5) material.roughness = Math.max(material.roughness, .42);
      }
    };
    model.traverse(soften); lid.traverse(soften); applyTheme();
    const screen = lid.getObjectByName("tfTbkkzhxqpKRgC");
    if (screen instanceof THREE.Mesh) {
      const desktop = document.createElement('canvas');
      const texture = new THREE.CanvasTexture(desktop);
      texture.colorSpace = THREE.SRGBColorSpace; texture.flipY = false; resources.add(texture);
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      // The display retains the lock-screen artwork without a click-to-unlock state.
      painter = createScreenPainter(desktop, () => { texture.needsUpdate = true; schedule(); }, () => { if (!disposed) callbacks.onError(); }, (r, g, b) => {
        glow.color.setRGB(r, g, b, THREE.SRGBColorSpace); schedule();
      });
      const original = screen.material;
      screen.material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
      // Original material belongs to the loaded asset and is no longer referenced by the screen.
      for (const mat of Array.isArray(original) ? original : [original]) {
        for (const value of Object.values(mat)) if (value instanceof THREE.Texture) resources.add(value);
        mat.dispose();
      }
    }
    ready = true; schedule();
  }, undefined, () => { if (!disposed) callbacks.onError(); });
  function disposeModel(object: THREE.Object3D) {
    object.traverse(node => {
      if (!(node instanceof THREE.Mesh)) return;
      node.geometry.dispose();
      for (const mat of Array.isArray(node.material) ? node.material : [node.material]) {
        for (const value of Object.values(mat)) if (value instanceof THREE.Texture) value.dispose();
        mat.dispose();
      }
    });
  }
  const resize = new ResizeObserver(schedule); resize.observe(host);
  const scrollContainer = window;
  scrollContainer.addEventListener("scroll", schedule, { passive: true }); reduced.addEventListener("change", schedule);
  renderer.domElement.addEventListener("webglcontextlost", callbacks.onError);
  renderer.domElement.addEventListener("click", click);
  renderer.domElement.addEventListener("pointermove", hover, { passive: true });
  renderer.domElement.addEventListener("pointerdown", down);
  renderer.domElement.addEventListener("pointerup", up);
  renderer.domElement.addEventListener("pointercancel", up);
  renderer.domElement.addEventListener("lostpointercapture", up);
  renderer.domElement.addEventListener("pointerleave", leave);
  renderer.domElement.addEventListener("touchstart", touchStart, { passive: false });
  schedule();
  return () => {
    disposed = true; cancelAnimationFrame(frame); resize.disconnect(); scrollContainer.removeEventListener("scroll", schedule);
    reduced.removeEventListener("change", schedule); renderer.domElement.removeEventListener("webglcontextlost", callbacks.onError);
    renderer.domElement.removeEventListener("click", click); renderer.domElement.removeEventListener("pointermove", hover);
    renderer.domElement.removeEventListener("pointerdown", down);
    renderer.domElement.removeEventListener("pointerup", up);
    renderer.domElement.removeEventListener("pointercancel", up);
    renderer.domElement.removeEventListener("lostpointercapture", up);
    renderer.domElement.removeEventListener("pointerleave", leave);
    renderer.domElement.removeEventListener("touchstart", touchStart);
    themeObserver.disconnect(); aluminium.clear();
    stickers.dispose();
    painter?.dispose(); host.style.cursor = "";
    disposeModel(scene); resources.forEach(texture => texture.dispose()); environment.dispose(); renderer.dispose(); renderer.domElement.remove();
  };
}
