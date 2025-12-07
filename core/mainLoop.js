import { renderer, scene } from './renderer.js';
import { camera, updateCameraControls } from './cameraController.js';

let updateFunctions = [];

export function registerUpdate(fn) {
    updateFunctions.push(fn);
}

export function startLoop() {
    let lastTime = performance.now();

    function animate() {
        requestAnimationFrame(animate);

        let now = performance.now();
        let delta = (now - lastTime) / 1000;
        lastTime = now;

        updateCameraControls(delta);

        for (let fn of updateFunctions) {
            fn(delta);
        }

        renderer.render(scene, camera);
    }

    animate();
}
