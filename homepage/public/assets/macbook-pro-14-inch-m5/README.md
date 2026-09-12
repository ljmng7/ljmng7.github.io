# MacBook Pro 14-inch M5

User-supplied original GLB from:
https://sketchfab.com/3d-models/macbook-pro-14-inch-m5-652a992f4f244122ae251f9cbb81da1e

The original model is kept intact at `source/macbook_pro_14_inch_M5.glb`.
The homepage loads that file directly with Three.js GLTFLoader. Included textures are retained.

Runtime setup is in `src/components/macbook-renderer.ts`:
- The upper assembly `RcexTyyhpuJYATQ` is attached to an X-axis hinge pivot.
- Its authored pose is approximately 110 degrees open; runtime rotation starts at +110 degrees (closed) and ends at -25 degrees (135 degrees open).
- The camera then approaches along the display normal, retaining viewport margins.
- Only the display material is replaced with a canvas texture painted by `src/components/lock-screen-painter.ts` (a macOS-style lock screen that unlocks to the wallpaper on click); the chassis, keyboard, lid, camera and ports remain the original 3D geometry and materials.

The source model retains its own Sketchfab licensing terms; no repository-wide license is granted by this note.
