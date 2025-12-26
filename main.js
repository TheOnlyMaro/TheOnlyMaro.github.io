import * as THREE from 'three';
import { CameraController } from './Controllers/CameraController.js';
import { createRenderer } from './core/renderer.js';
import { setupScene as setupLevelOne } from './scenes/LevelOne.js';
import { setupScene as setupLevelTwo } from './scenes/LevelTwo.js';
import { setupScene as setupLevelThree } from './scenes/LevelThree.js';
import { PortalRaycaster } from './portal_logic/portalRayCaster.js';
import { PortalSystem } from './portal_logic/portalSystem.js';
import { PortalTeleport } from './portal_logic/portalTeleport.js';
import { PortalRenderer } from './portal_logic/PortalRender.js';
import { CubeButtonRaycaster } from './portal_logic/CubeButtonRaycaster.js';
import { audioManager } from './Controllers/AudioManager.js';

// --- UI ELEMENTS ---
const menu = document.getElementById('main-menu');
const menuHome = document.getElementById('menu-home');
const menuOptions = document.getElementById('menu-options');

// Buttons
const startBtn = document.getElementById('start-btn');
const optionsBtn = document.getElementById('options-btn');
const backBtn = document.getElementById('back-btn');

// Tabs
const tabControls = document.getElementById('tab-controls');
const tabAudio = document.getElementById('tab-audio');
const panelControls = document.getElementById('panel-controls');
const panelAudio = document.getElementById('panel-audio');

// Inputs
const sensSlider = document.getElementById('sens-slider');
const sensNumber = document.getElementById('sens-number');
const ambientSlider = document.getElementById('ambient-slider');
const ambientNumber = document.getElementById('ambient-number');
const sfxSlider = document.getElementById('sfx-slider');
const sfxNumber = document.getElementById('sfx-number');

// HUD
const hudBlue = document.getElementById('hud-blue');
const hudOrange = document.getElementById('hud-orange');

// --- GAME STATE ---
let isGameActive = false; 
const CURRENT_LEVEL = 3; 
let setupSceneFunction = setupLevelThree;

//--- Setup scene ---
const { scene, walls, puzzle, collisionObjects, spawnPoint } = setupSceneFunction();
const portalRaycaster = new PortalRaycaster();
const cubeRaycaster = new CubeButtonRaycaster(10, new THREE.Vector3(0, 0, 0)); 
scene.add(portalRaycaster.debugRay);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);

const wallObstacles = [...walls];
if (puzzle && puzzle.door) wallObstacles.push(puzzle.door.model);

const cameraController = new CameraController(camera, scene, wallObstacles, collisionObjects);
if (spawnPoint) {
    cameraController.getPlayer().position.copy(spawnPoint);
    cameraController.getPlayer().prevPosition = spawnPoint.clone();
}

// ==========================================
//           MENU LOGIC (With Stop Propagation)
// ==========================================

// Helper: Prevents clicks from bubbling up to the window/game
const stopProp = (e) => e.stopPropagation();

// 1. Navigation
optionsBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // <--- CRITICAL
    menuHome.classList.add('hidden');
    menuOptions.classList.remove('hidden');
});

backBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // <--- CRITICAL
    menuOptions.classList.add('hidden');
    menuHome.classList.remove('hidden');
});

// 2. Tabs
tabControls.addEventListener('click', (e) => {
    e.stopPropagation();
    tabControls.classList.add('active');
    tabAudio.classList.remove('active');
    panelControls.classList.remove('hidden');
    panelAudio.classList.add('hidden');
});

tabAudio.addEventListener('click', (e) => {
    e.stopPropagation();
    tabAudio.classList.add('active');
    tabControls.classList.remove('active');
    panelAudio.classList.remove('hidden');
    panelControls.classList.add('hidden');
});

// 3. Inputs (Prevent dragging form inputs from firing game guns)
const inputs = [sensSlider, sensNumber, ambientSlider, ambientNumber, sfxSlider, sfxNumber];
inputs.forEach(input => {
    input.addEventListener('click', stopProp);
    input.addEventListener('mousedown', stopProp);
});


// 4. Data Sync Logic
function updateSensitivity(val) {
    cameraController.setSensitivity(parseFloat(val));
    sensSlider.value = val;
    sensNumber.value = val;
}
sensSlider.addEventListener('input', (e) => updateSensitivity(e.target.value));
sensNumber.addEventListener('input', (e) => updateSensitivity(e.target.value));
updateSensitivity(2.0);

function updateAmbient(val) {
    audioManager.setAmbientVolume(val);
    ambientSlider.value = val;
    ambientNumber.value = val;
}
ambientSlider.addEventListener('input', (e) => updateAmbient(e.target.value));
ambientNumber.addEventListener('input', (e) => updateAmbient(e.target.value));

function updateSFX(val) {
    audioManager.setSFXVolume(val);
    sfxSlider.value = val;
    sfxNumber.value = val;
}
sfxSlider.addEventListener('input', (e) => updateSFX(e.target.value));
sfxNumber.addEventListener('input', (e) => updateSFX(e.target.value));

updateAmbient(50);
updateSFX(80);


// ==========================================
//           GAME ENGINE SETUP
// ==========================================

const portalSystem = new PortalSystem();
scene.add(portalSystem);

const portalTeleport = new PortalTeleport(
  cameraController.getPlayer(),
  portalSystem,
  cameraController.collision,
  cameraController.mouse
);

const renderer = createRenderer();
const portalRenderer = new PortalRenderer(renderer, scene, camera);

window.addEventListener('wheel', e => e.preventDefault(), { passive: false });
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  portalRenderer.setSize(window.innerWidth, window.innerHeight);
});


// ==========================================
//           MASTER STATE CONTROLLER
// ==========================================

// 1. START BUTTON: The ONLY way to start the game
startBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent this click from bubbling
    audioManager.init(); 
    document.body.requestPointerLock();
});

// 2. POINTER LOCK: Handles Pause/Resume logic
document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === document.body) {
        // --- RESUME ---
        isGameActive = true;
        menu.style.display = 'none';
        menuHome.classList.remove('hidden');
        menuOptions.classList.add('hidden');
        
        audioManager.startAmbientMusic(); 

    } else {
        // --- PAUSE ---
        isGameActive = false;
        menu.style.display = 'flex'; 
        startBtn.innerText = "RESUME TEST";

        audioManager.stopMusic();
    }
});

// 3. GAMEPLAY INPUTS
window.addEventListener('click', () => {
  
  // STOP if we are in the menu. 
  // Since we added stopPropagation to buttons, this shouldn't fire on menu interaction,
  // but this is a double-check.
  if (!isGameActive) return;

  // Audio Safety Net
  if (!audioManager.isMusicLoopActive()) {
      audioManager.init();
      audioManager.startAmbientMusic();
  }

  // Cube Logic
  if (puzzle && puzzle.cube) {
    if (puzzle.cube.isHeld) {
      puzzle.cube.drop(scene);
      return; 
    } else if (cubeRaycaster.hitInfo) {
      const hitObj = cubeRaycaster.hitInfo.object;
      if (hitObj === puzzle.cube.mesh || (hitObj.userData && hitObj.userData.rootParent === puzzle.cube.mesh)) {
        puzzle.cube.pickup(cameraController.getPlayer());
        return; 
      }
    }
  }

  // Portal Logic
  if (portalRaycaster.hitInfo) {
    const placedPortal = portalSystem.placePortal(portalRaycaster.hitInfo);
    if (placedPortal === 'blue') audioManager.playPortalShoot('blue');
    if (placedPortal === 'orange') audioManager.playPortalShoot('orange');
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

function updateHUD() {
    if (portalSystem.bluePortalActive) {
        hudBlue.style.opacity = '1.0'; hudBlue.style.boxShadow = '0 0 20px #00aaff';
    } else {
        hudBlue.style.opacity = '0.2'; hudBlue.style.boxShadow = 'none';
    }
    if (portalSystem.orangePortalActive) {
        hudOrange.style.opacity = '1.0'; hudOrange.style.boxShadow = '0 0 20px #ffaa00';
    } else {
        hudOrange.style.opacity = '0.2'; hudOrange.style.boxShadow = 'none';
    }
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  portalRenderer.render(
    camera,
    portalSystem.bluePortalData,
    portalSystem.orangePortalData,
    portalSystem.bluePortalActive,
    portalSystem.orangePortalActive
  );
  renderer.render(scene, camera);

  if (!isGameActive) return;

  const rawDelta = clock.getDelta();
  const deltaTime = Math.min(rawDelta, 0.05); 

  cameraController.update(deltaTime);
  portalTeleport.update(deltaTime);
  
  const portalSurfaces = [...wallObstacles, ...collisionObjects];
  portalRaycaster.update(camera, portalSurfaces);
  
  portalSystem.update(portalRaycaster.hitInfo);
  portalSystem.blueHalo.animate(deltaTime);
  portalSystem.orangeHalo.animate(deltaTime);
  
  updateHUD();

  if (puzzle) {
    if (puzzle.cube) cubeRaycaster.update(camera, [puzzle.cube.mesh]);
    if (puzzle.button && puzzle.cube) puzzle.button.update(puzzle.cube.mesh);
    if (puzzle.door) puzzle.door.update(deltaTime);
  }

  try {
    const playerObj = cameraController.getPlayer();
    if (playerObj) {
      const playerBox = new THREE.Box3().setFromCenterAndSize(playerObj.position, new THREE.Vector3(0.7, 1.7, 0.7));
      let died = false;
      if (playerObj.position.y < -10) died = true;
      if (!died && scene.userData && Array.isArray(scene.userData.spikes)) {
        for (let s of scene.userData.spikes) {
          const sBox = new THREE.Box3().setFromObject(s);
          if (playerBox.intersectsBox(sBox)) { died = true; break; }
        }
      }
      if (died) {
        audioManager.playDeath(); 
        const spawn = (scene.userData && scene.userData.spawnPoint) ? scene.userData.spawnPoint.clone() : new THREE.Vector3(1, 1, 1);
        playerObj.position.copy(spawn);
        if (playerObj.prevPosition) playerObj.prevPosition.copy(spawn);
        if (cameraController.player) {
          if (cameraController.player.velocity) cameraController.player.velocity.set(0, 0, 0);
          cameraController.player.onGround = true;
        }
        if (scene.userData && typeof scene.userData.handlePlayerDeath === 'function') {
          scene.userData.handlePlayerDeath();
        }
      }
    }
  } catch (e) { console.warn('Death check error:', e); }
}

animate();