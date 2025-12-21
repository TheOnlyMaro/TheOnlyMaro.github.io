// import * as THREE from 'three';
// import { CameraController } from './Controllers/CameraController.js';
// import { createRenderer } from './core/renderer.js';
// import { setupScene } from './scenes/LevelOne.js';
// import { PortalRaycaster } from './portal_logic/portalRayCaster.js';
// import { PortalSystem } from './portal_logic/portalSystem.js';
// import { PortalTeleport } from './portal_logic/portalTeleport.js'; // NEW: added

// //--- Setup scene and walls ---
// const { scene, walls } = setupScene();
// const portalRaycaster = new PortalRaycaster();
// scene.add(portalRaycaster.debugRay);
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);

// // Pass walls array to CameraController for collisions
// const cameraController = new CameraController(camera, scene, walls);

// const portalSystem = new PortalSystem();
// scene.add(portalSystem);

// // NEW: Create PortalTeleport instance with collision controller
// const portalTeleport = new PortalTeleport(
//   cameraController.getPlayer(), // player object
//   portalSystem,                  // portal system
//   cameraController.collision     // collision controller
// );


// const renderer = createRenderer();

// // --- Prevent zoom ---
// window.addEventListener('wheel', e => e.preventDefault(), { passive: false });

// // --- WINDOW RESIZE LOGIC ---
// window.addEventListener('resize', () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// });

// window.addEventListener('click', () => {
//   if (portalRaycaster.hitInfo) portalSystem.placePortal(portalRaycaster.hitInfo);
// });

// const clock = new THREE.Clock();

// function animate() {
//   requestAnimationFrame(animate);
//   const deltaTime = clock.getDelta(); // MODIFIED: capture deltaTime for teleport cooldown

//   cameraController.update(); // updates player/camera
//   portalTeleport.update(deltaTime);   // MODIFIED: pass deltaTime to enable cooldown

//   portalRaycaster.update(
//     camera,    // camera for direction
//     walls      // array of objects to hit
//   );

//   portalSystem.update(portalRaycaster.hitInfo);
//   portalSystem.blueHalo.animate(deltaTime);
//   portalSystem.orangeHalo.animate(deltaTime);

//   renderer.render(scene, camera);
// }
// animate();

import * as THREE from 'three';
import { CameraController } from './Controllers/CameraController.js';
import { createRenderer } from './core/renderer.js';
import { setupScene } from './scenes/LevelOne.js';
import { PortalRaycaster } from './portal_logic/portalRayCaster.js';
import { PortalSystem } from './portal_logic/portalSystem.js';
import { PortalTeleport } from './portal_logic/portalTeleport.js'; // NEW: added
import { PortalRenderer } from './portal_logic/PortalRender.js';
//--- Setup scene and walls ---
const { scene, walls } = setupScene();
const portalRaycaster = new PortalRaycaster();
scene.add(portalRaycaster.debugRay);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);

// Pass walls array to CameraController for collisions
const cameraController = new CameraController(camera, scene, walls);

const portalSystem = new PortalSystem();
scene.add(portalSystem);

// NEW: Create PortalTeleport instance with collision controller
const portalTeleport = new PortalTeleport(
  cameraController.getPlayer(), // player object
  portalSystem,                  // portal system
  cameraController.collision     // collision controller
);


const renderer = createRenderer();
const portalRenderer = new PortalRenderer(renderer, scene, camera);

// --- Prevent zoom ---
window.addEventListener('wheel', e => e.preventDefault(), { passive: false });

// --- WINDOW RESIZE LOGIC ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('click', () => {
  if (portalRaycaster.hitInfo) {
    const placedPortal = portalSystem.placePortal(portalRaycaster.hitInfo);
    
    // Update portal renderer when portals are placed
    if (placedPortal) {
      portalRenderer.updatePortalMeshes(
        portalSystem.bluePortalData,
        portalSystem.orangePortalData,
        portalSystem.bluePortalActive,
        portalSystem.orangePortalActive
      );
    }
  }
});

const clock = new THREE.Clock();

// UPDATED: animate function
function animate() {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();

  cameraController.update();
  portalTeleport.update(deltaTime);

  portalRaycaster.update(camera, walls);
  portalSystem.update(portalRaycaster.hitInfo);
  portalSystem.blueHalo.animate(deltaTime);
  portalSystem.orangeHalo.animate(deltaTime);

  // NEW: Render portal views BEFORE main render
  portalRenderer.render(
    camera,
    portalSystem.bluePortalData,
    portalSystem.orangePortalData,
    portalSystem.bluePortalActive,
    portalSystem.orangePortalActive
  );

  // Main render
  renderer.render(scene, camera);
}
animate();
