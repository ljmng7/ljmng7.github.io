import * as THREE from "three";

// Die-cut stickers on the MacBook lid. Each is a subdivided plane whose vertex shader lifts
// and curls it like an iMessage sticker being peeled, and whose fragment shader adds a
// holographic foil sheen that reacts to the pointer-driven light. Stickers can be dragged
// off the lid: drifting on the wind by day, funneling into deep space by night.

const DIR = "/assets/stickers/";
const TEXTURE_SIZE = 512;
// Actual closed shell footprint, including its rounded corners.
const BOUNDS = { x: 1.55, z: 1.095, radius: .09 };
interface Spec { file: string; x: number; z: number; rotation: number; size: number }
const SPECS: Spec[] = [
  { file: "claude-color.svg", x: -.98, z: -.58, rotation: -21, size: .49 },
  { file: "claudecode-color.svg", x: .46, z: -.69, rotation: 14, size: .30 },
  { file: "codex-color.svg", x: -.67, z: .48, rotation: 17, size: .43 },
  { file: "gemini-color.svg", x: 1.12, z: .59, rotation: -19, size: .29 },
  { file: "github-original.svg", x: -.10, z: .76, rotation: -12, size: .34 },
  { file: "openai.svg", x: .64, z: .34, rotation: 24, size: .40 },
  { file: "swift.svg", x: 1.05, z: -.22, rotation: -14, size: .52 },
  { file: "xcode.svg", x: -1.17, z: .04, rotation: 10, size: .36 },
];

const VERTEX = /* glsl */`
uniform float uSize, uPeel, uLift;
uniform vec2 uPeelDir, uTilt;
uniform float uVanish, uWind;
uniform vec3 uEscape;
varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying float vCurl;
// Sticker surface in local space: uv.x -> +x, uv.y -> -z, normal +y.
vec3 deform(vec2 st, out float curl) {
  vec2 c = st - 0.5;
  vec3 p = vec3(c.x, 0.0, -c.y) * uSize;
  float fold = 0.5 - 0.48 * uPeel;
  float s = max(0.0, dot(c, uPeelDir) - fold) * uSize;
  curl = 0.0;
  if (s > 0.0) {
    // Wrap the region past the fold line around a cylinder; tanh keeps the far corner from bunching.
    float r = mix(0.7, 0.22, uPeel) * uSize;
    float a = 1.8 * tanh(s / (1.8 * r));
    float along = r * sin(a) - s;
    p.x += along * uPeelDir.x; p.z -= along * uPeelDir.y;
    p.y += r * (1.0 - cos(a));
    curl = a / 1.8;
  }
  float cx = cos(uTilt.x), sx = sin(uTilt.x);
  p.yz = mat2(cx, -sx, sx, cx) * p.yz;
  float cz = cos(uTilt.y), sz = sin(uTilt.y);
  p.xy = mat2(cz, -sz, sz, cz) * p.xy;
  // Spring overshoot and tilt must never push vertices through the aluminium.
  p.y = max(0.0, p.y + uLift);
  if (uVanish > 0.0 && uWind > 0.5) {
    float t = uVanish;
    float gust = smoothstep(0.0, 0.3, t);
    // Flexible paper flutters and tumbles as one sheet; it never funnels
    // into a point. All offsets start at zero to preserve the release pose.
    p.y += sin(c.x * 8.0 + c.y * 5.0 - t * 24.0) * uSize * .10 * gust;
    float roll = sin(t * 12.0) * .65 * gust + t * 3.8;
    p.xy = mat2(cos(roll), -sin(roll), sin(roll), cos(roll)) * p.xy;
    float yaw = t * 2.2 + sin(t * 9.0) * .3 * gust;
    p.xz = mat2(cos(yaw), -sin(yaw), sin(yaw), cos(yaw)) * p.xz;
    vec2 across = normalize(vec2(-uEscape.z, uEscape.x));
    p.xz += across * sin(t * 10.0) * .12 * gust;
    p += uEscape * (t * .35 + t * t * .65);
    p.y += sin(t * 3.14159) * .20;
  } else if (uVanish > 0.0) {
    vec2 direction = normalize(uEscape.xz);
    float leading = clamp(dot(p.xz / uSize, direction) + 0.5, 0.0, 1.0);
    // The leading edge travels first, drawing the mesh into a curved, narrow neck.
    float t = smoothstep(0.0, 1.0, clamp(uVanish * 1.45 - (1.0 - leading) * 0.45, 0.0, 1.0));
    vec3 start = p * pow(1.0 - t, 1.4);
    vec3 control = vec3(uEscape.x * .75, .35, uEscape.z * .75);
    p = (1.0 - t) * (1.0 - t) * start + 2.0 * (1.0 - t) * t * control + t * t * uEscape;
  }
  return p;
}
void main() {
  float curl, c1, c2;
  vec3 p = deform(uv, curl);
  vec3 pu = deform(uv + vec2(0.01, 0.0), c1);
  vec3 pv = deform(uv + vec2(0.0, 0.01), c2);
  vec3 n = normalize(cross(pu - p, pv - p));
  vUv = uv; vCurl = curl;
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vP = wp.xyz; vN = normalize(mat3(modelMatrix) * n);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAGMENT = /* glsl */`
uniform sampler2D uMap; uniform vec3 uLight; uniform float uHolo, uSheen, uHover, uOpacity;
uniform float uVanish;
varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying float vCurl;
void main() {
  vec4 tex = texture2D(uMap, vUv);
  if (tex.a < 0.03) discard;
  vec3 N = normalize(vN); if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vP);
  vec3 L = normalize(uLight - vP);
  vec3 H = normalize(L + V);
  float ndh = max(dot(N, H), 0.0), ndv = max(dot(N, V), 0.0), ndl = dot(N, L);
  float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
  // The white die-cut border is where the foil shows most.
  float border = smoothstep(0.72, 0.96, lum) * tex.a;
  // Diffraction-like hue shift: depends on view/light angle and position on the foil.
  float ang = 2.4 * ndh + 1.1 * ndl + 1.5 * (vUv.x - vUv.y) + 0.8 * vCurl;
  vec3 rainbow = 0.5 + 0.5 * cos(6.28318 * (ang + vec3(0.0, 0.33, 0.67)));
  float fres = pow(1.0 - ndv, 2.5);
  float glossy = pow(ndh, 22.0);
  float spec = pow(ndh, 160.0);
  // Diagonal sheen band that sweeps with the pointer.
  float band = exp(-pow((vUv.x + vUv.y) * 0.5 - uSheen, 2.0) * 26.0);
  float holo = uHolo * (0.22 + 0.78 * border) * (0.16 + 0.55 * glossy + 0.55 * fres + 0.4 * band + 0.3 * uHover);
  vec3 color = tex.rgb * (0.9 + 0.1 * max(ndl, 0.0));
  color += rainbow * holo;
  color += (spec * 0.8 + band * 0.1 * (0.4 + 0.6 * border) + uHover * 0.04) * vec3(1.0);
  color *= 1.0 - 0.3 * vCurl;
  gl_FragColor = vec4(color, tex.a * uOpacity * (1.0 - smoothstep(.76, 1.0, uVanish)));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

interface Sticker {
  arriving: boolean; arrivalIndex: number;
  escapeStart: number | null;
  pixels: Uint8ClampedArray;
  spec: Spec; mesh: THREE.Mesh; shadow: THREE.Mesh; material: THREE.ShaderMaterial; shadowMaterial: THREE.MeshBasicMaterial;
  peel: number; peelV: number; lift: number; liftV: number; tiltX: number; tiltZ: number; hover: number; sheen: number; sheenTarget: number;
}

// Rasterise an SVG into a sticker: white die-cut border around the artwork plus a faint rim.
async function rasterise(file: string): Promise<{ art: HTMLCanvasElement; shadow: HTMLCanvasElement }> {
  const response = await fetch(DIR + file);
  if (!response.ok) throw new Error(file);
  const doc = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
  const svg = doc.documentElement;
  svg.setAttribute("width", "1024"); svg.setAttribute("height", "1024");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet"); svg.removeAttribute("style");
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" }));
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error(file)); image.src = url; });
  } finally { URL.revokeObjectURL(url); }
  const S = TEXTURE_SIZE, pad = S * .16, inner = S - pad * 2, border = S * .05;
  const make = () => { const c = document.createElement("canvas"); c.width = c.height = S; return c; };
  const silhouette = make(); const sc = silhouette.getContext("2d")!;
  sc.drawImage(image, pad, pad, inner, inner);
  sc.globalCompositeOperation = "source-in"; sc.fillStyle = "#fff"; sc.fillRect(0, 0, S, S);
  const art = make(); const ac = art.getContext("2d")!;
  const ring = (radius: number) => { for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; ac.drawImage(silhouette, Math.cos(a) * radius, Math.sin(a) * radius); } };
  ac.globalAlpha = .18; ring(border + 1.5); ac.globalAlpha = 1; ring(border); ac.drawImage(silhouette, 0, 0);
  ac.drawImage(image, pad, pad, inner, inner);
  const shadow = make(); const hc = shadow.getContext("2d")!;
  hc.filter = "blur(7px)"; hc.drawImage(art, 0, 0);
  return { art, shadow };
}

export function createStickers(camera: THREE.Camera) {
  const group = new THREE.Group();
  const stickers: Sticker[] = [];
  const order: Sticker[] = [];
  const light = new THREE.Vector3(.8, 3, 1.4);
  const geometry = new THREE.PlaneGeometry(1, 1, 28, 28);
  const plane = new THREE.Plane(), hit = new THREE.Vector3(), local = new THREE.Vector3(), ndc = new THREE.Vector3();
  const grabOffset = new THREE.Vector2();
  let grabbed: Sticker | null = null, hovered: Sticker | null = null;
  let dragged = false, lastMove = 0, lastTime = 0, disposed = false;
  const velocity = new THREE.Vector2();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let arrivalStart: number | null = null;

  const restack = () => {
    order.forEach((s, i) => {
      s.mesh.position.y = .003 + i * .0006; s.shadow.position.y = s.mesh.position.y - .0003;
      s.shadow.renderOrder = 10 + i * 2; s.mesh.renderOrder = 11 + i * 2;
    });
  };
  const outside = (x: number, z: number) => Math.hypot(
    Math.max(0, Math.abs(x) - (BOUNDS.x - BOUNDS.radius)),
    Math.max(0, Math.abs(z) - (BOUNDS.z - BOUNDS.radius)),
  ) > BOUNDS.radius;
  const pickerPlane = () => {
    group.updateMatrixWorld(true);
    const normal = new THREE.Vector3(0, 1, 0).transformDirection(group.matrixWorld);
    plane.setFromNormalAndCoplanarPoint(normal, group.getWorldPosition(new THREE.Vector3()));
  };
  const stickerAt = (ray: THREE.Raycaster) => {
    pickerPlane();
    if (ray.ray.direction.dot(plane.normal) >= 0 || !ray.ray.intersectPlane(plane, hit)) return null;
    // GPU-deformed planes have no matching CPU triangles. Pick the flat footprint
    // in lid coordinates, including the texture alpha and current stacking order.
    for (const s of [...order].reverse()) {
      if (s.arriving || s.escapeStart !== null) continue;
      local.copy(hit); s.mesh.worldToLocal(local);
      const u = local.x / s.spec.size + .5, v = .5 - local.z / s.spec.size;
      if (u < 0 || u >= 1 || v <= 0 || v > 1) continue;
      const index = (Math.floor((1 - v) * TEXTURE_SIZE) * TEXTURE_SIZE + Math.floor(u * TEXTURE_SIZE)) * 4 + 3;
      if (s.pixels[index] > 32) return s;
    }
    return null;
  };

  const load = async () => {
    const results = await Promise.allSettled(SPECS.map(async spec => ({ spec, ...(await rasterise(spec.file)) })));
    if (disposed) return;
    for (const result of results) {
      if (result.status === "rejected") { console.error("Sticker failed to load", result.reason); continue; }
      const { spec, art, shadow } = result.value;
      const map = new THREE.CanvasTexture(art); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
      const shadowMap = new THREE.CanvasTexture(shadow);
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX, fragmentShader: FRAGMENT, transparent: true, side: THREE.DoubleSide, depthWrite: false,
        uniforms: {
          uMap: { value: map }, uLight: { value: light }, uSize: { value: spec.size },
          uPeel: { value: 0 }, uLift: { value: 0 }, uPeelDir: { value: new THREE.Vector2(0, 1) },
          uTilt: { value: new THREE.Vector2() }, uHolo: { value: .5 }, uSheen: { value: .5 }, uHover: { value: 0 },
          uVanish: { value: 0 }, uWind: { value: 0 }, uEscape: { value: new THREE.Vector3() }, uOpacity: { value: 0 },
        },
      });
      const mesh = new THREE.Mesh(geometry, material);
      const shadowMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, map: shadowMap, transparent: true, opacity: .3, depthWrite: false,
        // Test each shadow pixel against the lid's stencil silhouette, including
        // its rounded corners. The sticker itself remains free to overhang.
        stencilWrite: true, stencilWriteMask: 0, stencilRef: 1, stencilFunc: THREE.EqualStencilFunc,
      });
      const shadowMesh = new THREE.Mesh(geometry, shadowMaterial);
      mesh.visible = false; shadowMesh.visible = false;
      shadowMesh.rotation.x = -Math.PI / 2; shadowMesh.scale.setScalar(spec.size * 1.05);
      mesh.frustumCulled = false;
      const pixels = art.getContext("2d")!.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE).data;
      const sticker: Sticker = { arriving: true, arrivalIndex: stickers.length, escapeStart: null, pixels, spec, mesh, shadow: shadowMesh, material, shadowMaterial, peel: 0, peelV: 0, lift: 0, liftV: 0, tiltX: 0, tiltZ: 0, hover: 0, sheen: .5, sheenTarget: .5 };
      mesh.rotation.y = THREE.MathUtils.degToRad(spec.rotation);
      shadowMesh.rotation.z = mesh.rotation.y;
      mesh.position.set(spec.x, 0, spec.z);
      shadowMesh.position.set(mesh.position.x, 0, mesh.position.z);
      group.add(mesh, shadowMesh); stickers.push(sticker); order.push(sticker);
    }
    restack();
  };

  const updatePointerLight = (ray: THREE.Raycaster) => {
    // Virtual light hovering above the lid under the pointer, so the foil reacts to the cursor.
    pickerPlane();
    const lifted = plane.clone(); lifted.constant -= 1.6;
    if (ray.ray.intersectPlane(lifted, hit)) light.copy(hit);
    for (const s of stickers) {
      if (s.escapeStart !== null) continue;
      s.mesh.getWorldPosition(ndc).project(camera);
      const pointer = new THREE.Vector2(); // recovered from ray below
      // Pointer NDC is what the caller set on the raycaster; approximate via light projection.
      const lp = light.clone().project(camera); pointer.set(lp.x, lp.y);
      s.sheenTarget = .5 + .45 * THREE.MathUtils.clamp((pointer.x - ndc.x) * 1.4 + (pointer.y - ndc.y) * 1.4, -1, 1);
    }
  };

  return {
    group, load,
    get busy() { return grabbed !== null; },
    leave() { hovered = null; },
    /** True if the pointer is over a sticker (sets hover state). */
    hover(ray: THREE.Raycaster) {
      if (disposed) return false;
      updatePointerLight(ray);
      hovered = grabbed ?? stickerAt(ray);
      return hovered !== null;
    },
    /** Begin dragging the sticker under the pointer. Returns true if one was grabbed. */
    down(ray: THREE.Raycaster) {
      const s = stickerAt(ray); if (!s) return false;
      grabbed = s; dragged = false; velocity.set(0, 0); lastMove = performance.now();
      pickerPlane();
      if (ray.ray.intersectPlane(plane, hit)) {
        local.copy(hit); group.worldToLocal(local);
        grabOffset.set(local.x - s.mesh.position.x, local.z - s.mesh.position.z);
        // The edge farthest from the grip curls up.
        const grip = new THREE.Vector3(grabOffset.x, 0, grabOffset.y).applyAxisAngle(new THREE.Vector3(0, 1, 0), -s.mesh.rotation.y);
        const dir = new THREE.Vector2(-grip.x, grip.z);
        if (dir.length() < .02) dir.set(0, 1); dir.normalize();
        // uv space: +x right, +y towards -z.
        (s.material.uniforms.uPeelDir.value as THREE.Vector2).set(dir.x, dir.y);
      }
      order.splice(order.indexOf(s), 1); order.push(s); restack();
      return true;
    },
    move(ray: THREE.Raycaster) {
      if (!grabbed) return;
      pickerPlane();
      if (!ray.ray.intersectPlane(plane, hit)) return;
      local.copy(hit); group.worldToLocal(local);
      const now = performance.now(), dt = Math.max(1, now - lastMove) / 1000; lastMove = now;
      const px = grabbed.mesh.position.x, pz = grabbed.mesh.position.z;
      const x = local.x - grabOffset.x, z = local.z - grabOffset.y;
      grabbed.mesh.position.x = x; grabbed.mesh.position.z = z;
      const vx = (grabbed.mesh.position.x - px) / dt, vz = (grabbed.mesh.position.z - pz) / dt;
      velocity.x += (vx - velocity.x) * .35; velocity.y += (vz - velocity.y) * .35;
      if (Math.hypot(grabbed.mesh.position.x - px, grabbed.mesh.position.z - pz) > .002) dragged = true;
    },
    up() {
      const s = grabbed;
      if (s && outside(s.mesh.position.x, s.mesh.position.z)) {
        const target = new THREE.Vector3(s.mesh.position.x / BOUNDS.x, 0, s.mesh.position.z / BOUNDS.z).normalize().multiplyScalar(.85);
        const wind = !document.documentElement.classList.contains("dark");
        s.material.uniforms.uWind.value = wind ? 1 : 0;
        if (wind) { target.multiplyScalar(.8); target.z -= .75; target.y = .22; }
        else target.y = -1.8;
        target.applyAxisAngle(new THREE.Vector3(0, 1, 0), -s.mesh.rotation.y);
        s.material.uniforms.uEscape.value.copy(target);
        s.escapeStart = performance.now();
        hovered = null; dragged = true;
      }
      grabbed = null;
    },
    /** True once if the last pointer interaction moved a sticker (so it should not count as a click). */
    consumeDrag() { const d = dragged; dragged = false; return d; },
    /** Advance springs; returns true while anything is still moving. */
    animate(now: number) {
      if (arrivalStart === null && stickers.length) arrivalStart = now;
      const dt = lastTime ? Math.min((now - lastTime) / 1000, .025) : 1 / 60; lastTime = now;
      let moving = false;
      const spring = (value: number, vel: number, target: number, k: number, c: number): [number, number] => {
        vel += (k * (target - value) - c * vel) * dt; value += vel * dt; return [value, vel];
      };
      for (const s of stickers) {
        if (s.arriving) {
          const t = THREE.MathUtils.clamp((now - arrivalStart! - 150 - s.arrivalIndex * (reduced.matches ? 60 : 180)) / (reduced.matches ? 220 : 1100), 0, 1);
          const eased = THREE.MathUtils.smoothstep(t, 0, 1);
          const float = reduced.matches ? 0 : 1 - eased;
          const phase = s.arrivalIndex * 2.4;
          const opacity = THREE.MathUtils.smoothstep(t, 0, reduced.matches ? 1 : .42);
          s.mesh.visible = t > 0; s.shadow.visible = t > 0;
          s.mesh.position.x = s.spec.x;
          s.mesh.position.z = s.spec.z;
          s.mesh.rotation.y = THREE.MathUtils.degToRad(s.spec.rotation);
          const u = s.material.uniforms;
          u.uOpacity.value = opacity;
          u.uLift.value = (.42 + Math.sin(t * Math.PI * 3) * .025) * float;
          u.uPeel.value = .55 * float;
          u.uSheen.value = .5 + Math.sin(t * Math.PI * 2) * .35 * float;
          (u.uTilt.value as THREE.Vector2).set(Math.sin(phase + t * 5) * .28 * float, Math.cos(phase + t * 4) * .22 * float);
          s.shadow.position.x = s.mesh.position.x + .025 * float;
          s.shadow.position.z = s.mesh.position.z + .02 * float;
          s.shadow.rotation.z = s.mesh.rotation.y;
          s.shadow.scale.setScalar(s.spec.size * (1.01 + .22 * float));
          s.shadowMaterial.opacity = opacity * (.22 - .14 * float);
          if (t === 1) s.arriving = false;
          moving = true;
          continue;
        }
        if (s.escapeStart !== null) {
          const wind = s.material.uniforms.uWind.value > .5;
          const duration = reduced.matches ? 220 : wind ? 2200 : 950;
          const t = THREE.MathUtils.clamp((now - s.escapeStart) / duration, 0, 1);
          s.material.uniforms.uVanish.value = reduced.matches ? 0 : t;
          s.material.uniforms.uOpacity.value = reduced.matches ? 1 - t : 1;
          s.shadowMaterial.opacity = (.22 - THREE.MathUtils.clamp(s.lift / .09, 0, 1) * .1) * (1 - THREE.MathUtils.smoothstep(t, 0, .35));
          s.shadow.visible = t < .35;
          s.mesh.visible = t < 1;
          if (t < 1) moving = true;
          continue;
        }
        const held = s === grabbed;
        [s.peel, s.peelV] = spring(s.peel, s.peelV, held ? 1 : 0, 140, held ? 16 : 11);
        [s.lift, s.liftV] = spring(s.lift, s.liftV, held ? .09 : (s === hovered ? .012 : 0), 170, held ? 18 : 12);
        const tx = held ? THREE.MathUtils.clamp(velocity.y * .5, -.5, .5) : 0;
        const tz = held ? THREE.MathUtils.clamp(-velocity.x * .5, -.5, .5) : 0;
        s.tiltX += (tx - s.tiltX) * Math.min(1, dt * 9); s.tiltZ += (tz - s.tiltZ) * Math.min(1, dt * 9);
        s.hover += ((held || s === hovered ? 1 : 0) - s.hover) * Math.min(1, dt * 8);
        s.sheen += (s.sheenTarget - s.sheen) * Math.min(1, dt * 6);
        if (!held) velocity.multiplyScalar(Math.exp(-dt * 6));
        const u = s.material.uniforms;
        u.uPeel.value = THREE.MathUtils.clamp(s.peel, 0, 1); u.uLift.value = Math.max(0, s.lift); u.uHover.value = s.hover; u.uSheen.value = s.sheen;
        (u.uTilt.value as THREE.Vector2).set(s.tiltX, s.tiltZ);
        // Shadow drifts and softens as the sticker rises.
        const rise = THREE.MathUtils.clamp(s.lift / .09, 0, 1);
        s.shadow.visible = true;
        s.shadow.position.x = s.mesh.position.x + rise * .025; s.shadow.position.z = s.mesh.position.z + rise * .02;
        s.shadow.scale.setScalar(s.spec.size * (1.01 + rise * .12));
        s.shadowMaterial.opacity = .22 - rise * .1;
        if (Math.abs(s.hover - (held || s === hovered ? 1 : 0)) > 1e-3 || Math.abs(s.lift - (held ? .09 : s === hovered ? .012 : 0)) > 1e-3 || Math.abs(s.peelV) > 1e-3 || Math.abs(s.liftV) > 1e-3 || Math.abs(s.peel - (held ? 1 : 0)) > 1e-3 ||
          Math.abs(s.sheen - s.sheenTarget) > 2e-3 || Math.abs(s.tiltX) + Math.abs(s.tiltZ) > 1e-3 || held) moving = true;
      }
      if (!moving) lastTime = 0;
      return moving;
    },
    dispose() {
      disposed = true; geometry.dispose();
      for (const s of stickers) {
        (s.material.uniforms.uMap.value as THREE.Texture).dispose(); s.material.dispose();
        s.shadowMaterial.map?.dispose(); s.shadowMaterial.dispose();
      }
      group.removeFromParent();
    },
  };
}
