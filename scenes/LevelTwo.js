import * as THREE from 'three';
import { setupLights } from '../decor/lights.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { buildRoom } from './Room.js';
import { buildCorridor } from './Corridor.js';
import { createLabWallMaterial, createMetalWallMaterial, createMetalFloorMaterial, createCeiling2Material } from '../textures/materials_TextureMapping.js';
import { DraggableCube, FloorButton, Door } from '../puzzle_logic/PuzzleObjects.js';

export function setupScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);

    const allWalls = [];

    // --- Room 1 ---
    // Start room at (0,0,0). Remove the RIGHT wall so we can connect the corridor.
    // Use default Lab Material
    const room1 = buildRoom(40, 10, { showBack: true, showFront: true, showLeft: true, showRight: false }, createLabWallMaterial);
    scene.add(room1.room);
    allWalls.push(...room1.walls);

    // FIX VOID: Add filler walls for Room 1 Right side
    // Gap is z = -5 to 5 (width 10). Wall is z = -20 to 20 (width 40).
    // Filler 1: z = -20 to -5 (width 15). Center: -12.5.
    // Filler 2: z = 5 to 20 (width 15). Center: 12.5.
    const r1Filler1 = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 15), createLabWallMaterial());
    r1Filler1.position.set(20, 5, -12.5);
    r1Filler1.receiveShadow = true;
    scene.add(r1Filler1);
    allWalls.push(r1Filler1);

    const r1Filler2 = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 15), createLabWallMaterial());
    r1Filler2.position.set(20, 5, 12.5);
    r1Filler2.receiveShadow = true;
    scene.add(r1Filler2);
    allWalls.push(r1Filler2);


    // --- Corridor ---
    // Corridor ends are open via options, but physically the corridor object is a tube/floor/ceiling.
    // Length 80.
    const corridorData = buildCorridor(80, 10, 10, { openEnds: true });
    corridorData.corridor.position.set(60, 0, 0);
    corridorData.corridor.rotation.y = Math.PI / 2; // Rotate to align with X axis
    scene.add(corridorData.corridor);
    allWalls.push(...corridorData.walls);

    // --- Room 2 ---
    // Room 2 at x=120. Remove LEFT wall to connect.
    // Use METAL Material for a different look: Metal Wall, Metal Floor, Ceiling 2.
    const room2Opts = { showBack: true, showFront: true, showLeft: false, showRight: true };
    const room2 = buildRoom(
        40,
        10,
        room2Opts,
        createMetalWallMaterial,
        createMetalFloorMaterial,
        createCeiling2Material
    );
    room2.room.position.set(120, 0, 0);
    scene.add(room2.room);
    allWalls.push(...room2.walls);

    // FIX VOID: Add filler walls for Room 2 Left side
    // Room 2 center is 120. Left wall is at x = 100 relative to world (or -20 relative to room).
    // We use Metal Material here to match Room 2.
    const r2Filler1 = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 15), createMetalWallMaterial());
    r2Filler1.position.set(100, 5, -12.5);
    r2Filler1.receiveShadow = true;
    scene.add(r2Filler1);
    allWalls.push(r2Filler1);

    const r2Filler2 = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 15), createMetalWallMaterial());
    r2Filler2.position.set(100, 5, 12.5);
    r2Filler2.receiveShadow = true;
    scene.add(r2Filler2);
    allWalls.push(r2Filler2);

    // --- PUZZLE SETUP ---
    // 1. Door at the end of the corridor (blocking Room 2)
    // Corridor ends at x=100.
    const door = new Door(scene, new THREE.Vector3(100, 0, 0));

    // 2. Button in Room 1
    // Room 1 center is (0,0,0). Let's put button at (-10, 0, 0)
    const button = new FloorButton(scene, new THREE.Vector3(-10, 0.1, 0), door);

    // 3. Cube in Room 1
    // Put it nearby
    const cube = new DraggableCube(scene, new THREE.Vector3(5, 2, 0));


    // --- Finalize Matrices for Collision ---
    scene.updateMatrixWorld(true);

    // --- Lights ---
    setupLights(scene, 200, 10);

    // --- Environment ---
    const exrLoader = new EXRLoader();
    exrLoader.load('./textures/studio_small_09_4k.exr', texture => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
    }, undefined, error => console.error('EXR failed to load:', error));

    return { scene, walls: allWalls, puzzle: { door, button, cube }, collisionObjects: [] };
}
