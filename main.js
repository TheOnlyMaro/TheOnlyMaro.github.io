import * as THREE from 'three';
import { CameraController } from './Controllers/CameraController.js';
import { createRenderer } from './core/renderer.js';
import { setupScene as setupLevelOne } from './scenes/LevelOne.js';
import { setupScene as setupLevelTwo } from './scenes/LevelTwo.js';
import { setupScene as setupLevelThree } from './scenes/LevelThree.js';
import { PortalRaycaster } from './portal_logic/portalRayCaster.js';
import { PortalSystem } from './portal_logic/portalSystem.js';
import { PortalTeleport } from './portal_logic/portalTeleport.js'; // NEW: added
import { PortalRenderer } from './portal_logic/PortalRender.js';
import { CubeButtonRaycaster } from './portal_logic/CubeButtonRaycaster.js';

// Level selection - change this to test different levels
const CURRENT_LEVEL = 3; // 1, 2, or 3

let setupSceneFunction;
setupSceneFunction = setupLevelThree;
// if (CURRENT_LEVEL === 1) {
//   setupSceneFunction = setupLevelOne;
// } else if (CURRENT_LEVEL === 2) {
//   setupSceneFunction = setupLevelTwo;
// } else if (CURRENT_LEVEL === 3) {
//   setupSceneFunction = setupLevelThree;
// } else {
//   setupSceneFunction = setupLevelTwo; // Default
// }

//--- Setup scene and walls ---
const { scene, walls, puzzle, collisionObjects, spawnPoint } = setupSceneFunction();
const portalRaycaster = new PortalRaycaster();
const cubeRaycaster = new CubeButtonRaycaster(10, new THREE.Vector3(0, 0, 0)); // Max distance 10
scene.add(portalRaycaster.debugRay);
if (puzzle && puzzle.cube) {
  // Add cube to raycaster check
  // Note: cubeRaycaster logic needs array of objects
}
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);

// SEPARATION OF CONCERNS:
// 'walls' are vertical barriers (LevelThree.js populates this)
// 'collisionObjects' are floors/platforms (LevelThree.js populates this)

// Collect any dynamic obstacles (like the door) that act as WALLS
const wallObstacles = [...walls];
if (puzzle && puzzle.door) {
    wallObstacles.push(puzzle.door.model);
}

console.log('Level loaded - Walls:', wallObstacles.length, 'Floors:', collisionObjects.length);

// Instantiate CameraController
// Arg 3: Walls (Stop walking)
// Arg 4: Floors (Stop falling)
const cameraController = new CameraController(camera, scene, wallObstacles, collisionObjects);

// Apply Spawn Point
if (spawnPoint) {
    cameraController.getPlayer().position.copy(spawnPoint);
    // Important: Reset previous position too, or collision might snap back
    cameraController.getPlayer().prevPosition = spawnPoint.clone();
}

const portalSystem = new PortalSystem();
scene.add(portalSystem);

// NEW: Create PortalTeleport instance with collision controller
const portalTeleport = new PortalTeleport(
  cameraController.getPlayer(), // player object
  portalSystem,                  // portal system
  cameraController.collision,     // collision controller
  cameraController.mouse
);


const renderer = createRenderer();
// const renderer = new THREE.WebGLRenderer({ 
//   canvas: document.querySelector('canvas'),
//   stencil: true,      // ← ADD THIS!
//   antialias: true,
//   alpha: false
// });
const portalRenderer = new PortalRenderer(renderer, scene, camera);

// --- Prevent zoom ---
window.addEventListener('wheel', e => e.preventDefault(), { passive: false });

// --- WINDOW RESIZE LOGIC ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  portalRenderer.setSize(window.innerWidth, window.innerHeight); // Update portal shader resolution
});

window.addEventListener('click', () => {
  // 1. Try to toggle Cube (Pickup/Drop)
  if (puzzle && puzzle.cube) {
    if (puzzle.cube.isHeld) {
      puzzle.cube.drop(scene);
      return; // Don't shoot portal if we just dropped something
    } else if (cubeRaycaster.hitInfo) {
      // Check if hit object is the cube or a child of the cube
      const hitObj = cubeRaycaster.hitInfo.object;
      if (hitObj === puzzle.cube.mesh || (hitObj.userData && hitObj.userData.rootParent === puzzle.cube.mesh)) {
        puzzle.cube.pickup(cameraController.getPlayer()); // Attach to player/camera
        return; // Don't shoot portal
      }
    }
  }

  // 2. Shoot Portal (if not interacting with Cube)
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
  const rawDelta = clock.getDelta();
  const deltaTime = Math.min(rawDelta, 0.05); // Cap deltaTime to avoid large jumps

  cameraController.update(deltaTime);
  portalTeleport.update(deltaTime);

  // Portal raycaster can hit both walls and floors
  const portalSurfaces = [...wallObstacles, ...collisionObjects];
  portalRaycaster.update(camera, portalSurfaces);
  portalSystem.update(portalRaycaster.hitInfo);
  portalSystem.blueHalo.animate(deltaTime);
  portalSystem.orangeHalo.animate(deltaTime);

  // --- PUZZLE UPDATE ---
  if (puzzle) {
    // Raycast for cube selection
    if (puzzle.cube) {
      cubeRaycaster.update(camera, [puzzle.cube.mesh]);
    }

    // Update Button Logic
    if (puzzle.button && puzzle.cube) {
      puzzle.button.update(puzzle.cube.mesh);
    }

    // Update Door Animation
    if (puzzle.door) {
      puzzle.door.update(deltaTime);
    }
  }

  // --- DEATH / SPIKE CHECK ---
  try {
    const playerObj = cameraController.getPlayer();
    if (playerObj) {
      const playerBox = new THREE.Box3().setFromCenterAndSize(playerObj.position, new THREE.Vector3(0.7, 1.7, 0.7));

      let died = false;

      // Fall death threshold
      if (playerObj.position.y < -10) died = true;

      // Spike collisions from level (if provided)
      if (!died && scene.userData && Array.isArray(scene.userData.spikes) && scene.userData.spikes.length) {
        for (let s of scene.userData.spikes) {
          const sBox = new THREE.Box3().setFromObject(s);
          if (playerBox.intersectsBox(sBox)) {
            died = true;
            break;
          }
        }
      }

      if (died) {
        // Respawn player at level spawn point
        const spawn = (scene.userData && scene.userData.spawnPoint) ? scene.userData.spawnPoint.clone() : new THREE.Vector3(1, 1, 1);
        playerObj.position.copy(spawn);
        if (playerObj.prevPosition) playerObj.prevPosition.copy(spawn);
        // Reset player velocity/onGround via cameraController.player (PlayerController instance)
        if (cameraController.player) {
          if (cameraController.player.velocity) cameraController.player.velocity.set(0, 0, 0);
          cameraController.player.onGround = true;
        }
        // Trigger first-death behavior if present
        if (scene.userData && typeof scene.userData.handlePlayerDeath === 'function') {
          scene.userData.handlePlayerDeath();
        }
      }
    }
  } catch (e) {
    console.warn('Death check error:', e);
  }

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
