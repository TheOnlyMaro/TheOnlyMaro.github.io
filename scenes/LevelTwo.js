import * as THREE from 'three';
import { setupLights } from '../decor/lights.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { buildRoom } from './Room.js';
import { buildCorridor } from './Corridor.js';

export function setupScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);

    const allWalls = [];

    // --- Room 1 ---
    // Start room at (0,0,0). Remove the RIGHT wall so we can connect the corridor.
    const room1 = buildRoom(40, 10, { showBack: true, showFront: true, showLeft: true, showRight: false });
    scene.add(room1.room);
    allWalls.push(...room1.walls);

    // --- Corridor ---
    // Corridor is 80 long. If Room 1 ends at x=20, corridor starts at x=20.
    // Center of corridor should be at x = 20 + (80/2) = 60.
    const corridorData = buildCorridor(80, 10, 10, { openEnds: true });
    corridorData.corridor.position.set(60, 0, 0);
    // Rotate corridor to align with X axis (by default it's aligned with Z probably)
    // Wait, createFloor/createWalls usually centered around origin.
    // Let's check rotation. Usually Z is forward/back.
    corridorData.corridor.rotation.y = Math.PI / 2; // Rotate to face X axis
    scene.add(corridorData.corridor);
    allWalls.push(...corridorData.walls);

    // --- Room 2 ---
    // Room 2 starts where corridor ends (x = 60 + 40 = 100).
    // Room 2 center is at x = 100 + 20 = 120.
    // Remove the LEFT wall to connect to the corridor.
    const room2 = buildRoom(40, 10, { showBack: true, showFront: true, showLeft: false, showRight: true });
    room2.room.position.set(120, 0, 0);
    scene.add(room2.room);
    allWalls.push(...room2.walls);

    // --- Finalize Matrices for Collision ---
    scene.updateMatrixWorld(true);

    // --- Lights ---
    setupLights(scene, 200, 10); // Bigger light area

    // --- Environment ---
    const exrLoader = new EXRLoader();
    exrLoader.load('./textures/studio_small_09_4k.exr', texture => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
    }, undefined, error => console.error('EXR failed to load:', error));

    return { scene, walls: allWalls };
}
