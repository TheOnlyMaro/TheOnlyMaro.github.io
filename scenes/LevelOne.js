import * as THREE from 'three';
import { setupLights } from '../decor/lights.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { createWalls } from '../obstacles/walls.js';
import { createFloor, createCeiling } from '../decor/floor_ceiling.js';


export function setupScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);

    const floorSize = 40;
    const wallHeight = 10;

    // --- Floor & Ceiling ---
    const floor = createFloor(floorSize);
    scene.add(floor);

    const ceiling = createCeiling(floorSize, wallHeight);
    scene.add(ceiling);

    // --- Walls ---
    const walls = createWalls(floorSize, wallHeight);
    walls.forEach(wall => scene.add(wall));

    // --- Obstacles ---
   // const obstacles = setupObstacles(scene);

    // --- Lights ---
    setupLights(scene, floorSize, wallHeight);

    // --- Environment mapping ---
    const exrLoader = new EXRLoader();
    exrLoader.load('./textures/studio_small_09_4k.exr', texture => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.background = texture;
    }, undefined, error => console.error('EXR failed to load:', error));

    return { scene, walls, collisionObjects: [] };
}
