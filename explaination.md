# Explanation of `index.html`
This file builds an interactive 3D Arabic “main entrance” scene using Three.js.  
It presents a crystal cave tunnel with branch entrances the user can scroll through and click/tap to navigate to domain sections.

## 1) Document and layout basics
- Declares Arabic language (`lang="ar"`) and right-to-left direction (`direction: rtl`).
- Uses full-screen canvas rendering and disables scrolling (`overflow: hidden`).
- Includes:
  - `#fade-overlay`: a full-screen dark layer for transition fade-out.
  - `#orientation-screen`: an overlay message asking mobile users to rotate to landscape.

## 2) Rendering engine and scene setup
- Loads Three.js from CDN.
- Creates:
  - `scene` with exponential fog.
  - `camera` (PerspectiveCamera) starting at `z = 150`.
  - `renderer` with antialiasing, high-performance preference, and capped pixel ratio.
- Adds lighting:
  - Ambient light for global visibility.
  - Point light (`headlight`) that follows camera depth.

## 3) Cave geometry styling
- `applyCrystallineDisplacement(geometry)` modifies each vertex to create rough rock/crystal walls.
- It also assigns per-vertex colors and recalculates normals for proper shading.
- Main tunnel:
  - Cylinder geometry rotated into tunnel orientation.
  - Translated backward in Z to create long forward depth.
  - Rendered with a Lambert material (double-sided, flat shading, emissive tint).

## 4) Branches and signboards
- Defines three branch domains in `branchesConfig`:
  - Natural sciences (`natural`)
  - Social sciences (`social`)
  - Formal sciences (`formal`)
- For each branch:
  - Generates a side tunnel mesh using the same crystalline displacement.
  - Adds a glowing canvas-based signboard with Arabic text.
  - Stores clickable redirect target in `signMesh.userData.redirectUrl`, e.g.:
    - `sections.html?domain=natural`
    - `sections.html?domain=social`
    - `sections.html?domain=formal`

## 5) Navigation and interaction model
- Movement depth is controlled by `targetZ` and smoothed into `currentZ`.
- Input handling:
  - Touch drag (`touchmove`) changes `targetZ`.
  - Mouse wheel (`wheel`) changes `targetZ`.
  - Both clamp movement range between `150` and `-2900`.
- Click/tap handling:
  - Raycaster checks intersections with signboards.
  - On hit: starts transition, adjusts target depth, fades overlay, then redirects after 600ms.

## 6) Animation loop
- `animate()` continuously:
  - Interpolates camera Z toward target Z for smooth motion.
  - Moves headlight with camera.
  - Renders the scene each frame.

## 7) Responsive behavior
- On `resize`, camera aspect and renderer size are updated.
- CSS media query shows orientation overlay when the device is in portrait mode.

## 8) Overall user experience
The page simulates flying through a crystalline tunnel.  
Users scroll or swipe to move deeper, then select one of three glowing branch signs to enter a specific knowledge domain page.
