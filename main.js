import { renderer, scene } from './core/renderer.js';
import { camera } from './core/cameraController.js';
import { startLoop } from './core/mainLoop.js';

// temporary: add a floor for testing
// Floor from previous test removed.


// light
// light (handled by level now, but keeping global light is okay/redundant. Level has point light.)
// Remove default light/floor to avoid clutter.
// const light = new THREE.DirectionalLight(0xffffff, 1);
// light.position.set(10, 20, 10);
// light.castShadow = true;
// scene.add(light);

import { loadLevel } from './levels/level1.js';
import { setColliders } from './core/cameraController.js';

const colliders = loadLevel(scene);
setColliders(colliders);

// Start game loop
startLoop();
