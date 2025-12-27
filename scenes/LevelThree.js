import * as THREE from 'three';
import { DraggableCube, FloorButton, Door } from '../puzzle_logic/PuzzleObjects.js';
import { createLabWallMaterial, createMetalFloorMaterial } from '../textures/materials_TextureMapping.js';
import { setupLevelThreeLights } from '../decor/lights.js';

export function setupScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const walls = [];
    const collisionObjects = [];
    scene.userData.spikes = [];

    // --- LIGHTING ---
    setupLevelThreeLights(scene);

    // --- CONSTANTS ---
    const TUNNEL_WIDTH = 10;
    const CEILING_HEIGHT = 10; // Global ceiling Y position
    const WALL_THICKNESS = 1;

    // --- HELPER: BUILD FULL TUNNEL SECTION ---
    function createTunnel(x, yFloor, z, length, isPit = false) {
        const floor = addBox(scene, x, yFloor, z, length, 0.5, TUNNEL_WIDTH, createMetalFloorMaterial());
        collisionObjects.push(floor);
        addBox(scene, x, CEILING_HEIGHT, z, length, 1, TUNNEL_WIDTH, createLabWallMaterial(), walls);
        const wallHeight = CEILING_HEIGHT - yFloor;
        const wallY = yFloor + (wallHeight / 2);
        addBox(scene, x, wallY, z - (TUNNEL_WIDTH / 2) - 0.5, length, wallHeight, WALL_THICKNESS, createLabWallMaterial(), walls);
        addBox(scene, x, wallY, z + (TUNNEL_WIDTH / 2) + 0.5, length, wallHeight, WALL_THICKNESS, createLabWallMaterial(), walls);
        return floor;
    }

    // --- 1. STARTING CORRIDOR (X: 0 to 80) ---
    createTunnel(40, 0, 0, 80);

    const ambientButton = new FloorButton(scene, new THREE.Vector3(2, 0.3, 0), {
        open: () => {
            scene.userData.ambientLight.intensity = 0.6;
            if (scene.userData.bulb1Glow) scene.userData.bulb1Glow.visible = true;
            if (scene.userData.bulb2Glow) {
                scene.userData.bulb2Glow.visible = true;
                scene.userData.bulb2Light.intensity = 5;
            }
            if (scene.userData.bulb3Glow) {
                scene.userData.bulb3Glow.visible = true;
                scene.userData.bulb3Light.intensity = 5;
            }
        },
        close: () => {
            // Do nothing - lights stay on once activated
        }
    });




    // --- 2. THE PIT AREA (X: 80 to 160) ---
    const pitY = -8;
    const pitLength = 80;
    const pitCenterX = 120;

    addBox(scene, pitCenterX, CEILING_HEIGHT, 0, pitLength, 1, TUNNEL_WIDTH, createLabWallMaterial(), walls);
    addBox(scene, pitCenterX, 1, -5.5, pitLength, 18, 1, createLabWallMaterial(), walls);
    addBox(scene, pitCenterX, 1, 5.5, pitLength, 18, 1, createLabWallMaterial(), walls);

    // -- PIT FLOOR SECTIONS --
    const spikeFloorX = 105;
    const spikeFloorLen = 50;
    addBox(scene, spikeFloorX, pitY, 0, spikeFloorLen, 0.5, TUNNEL_WIDTH, createMetalFloorMaterial(), collisionObjects);
    addBox(scene, spikeFloorX - 7.75, 0, 0, 27, 0.5, TUNNEL_WIDTH, createMetalFloorMaterial(), collisionObjects);
    addBox(scene, spikeFloorX + 2, 1, 0, 8, 0.5, TUNNEL_WIDTH, createMetalFloorMaterial(), collisionObjects);
    addBox(scene, spikeFloorX - 2, 0.5, 0, 0.5, 1, TUNNEL_WIDTH, createLabWallMaterial(), walls);
    addBox(scene, spikeFloorX + 31, 0, 0, 20, 0.5, TUNNEL_WIDTH, createMetalFloorMaterial(), collisionObjects);
    addBox(scene, spikeFloorX + 40.5, 2, 0, 0.5, 4, TUNNEL_WIDTH, createLabWallMaterial(), walls);
    addBox(scene, spikeFloorX + 54, 4, 0, 27, 0.5, TUNNEL_WIDTH, createMetalFloorMaterial(), collisionObjects);

    createSpikeArea(scene, new THREE.Vector3(spikeFloorX - 21, pitY, 0), spikeFloorLen - 46, TUNNEL_WIDTH - 1);
    // Wall BEFORE first spikes
    addBox(scene, spikeFloorX - 25, -4, 0, 0.5, 8, TUNNEL_WIDTH, createLabWallMaterial(), walls);
    // Wall AFTER first spikes
    addBox(scene, spikeFloorX - 20.5, -4, 0, 0.5, 8, TUNNEL_WIDTH, createLabWallMaterial(), walls);
    createSpikeArea(scene, new THREE.Vector3(spikeFloorX + 15, pitY, 0), spikeFloorLen - 35, TUNNEL_WIDTH - 1);
    // Wall BEFORE second spikes
    addBox(scene, spikeFloorX + 5, -4, 0, 0.5, 10, TUNNEL_WIDTH, createLabWallMaterial(), walls);
    // Wall AFTER second spikes
    addBox(scene, spikeFloorX + 22, -4, 0, 0.5, 8, TUNNEL_WIDTH, createLabWallMaterial(), walls);
    const safeLandX = 137.5;
    const safeLandLen = 15;
    addBox(scene, safeLandX, pitY, 0, safeLandLen, 0.5, TUNNEL_WIDTH, createMetalFloorMaterial(), collisionObjects);

    addBox(scene, 148, pitY + 2.5, 0, 5, 1, TUNNEL_WIDTH, createMetalFloorMaterial(), collisionObjects);
    addBox(scene, 153, pitY + 5.0, 0, 5, 1, TUNNEL_WIDTH, createMetalFloorMaterial(), collisionObjects);
    addBox(scene, 158, pitY + 7.5, 0, 5, 1, TUNNEL_WIDTH, createMetalFloorMaterial(), collisionObjects);


    // ==========================================
    // 3. THE SPIKE HALLWAY (Z Axis)
    // ==========================================
    const hallZStart = 5;
    const hallLength = 50;
    const hallCenterZ = hallZStart + (hallLength / 2);
    const hallX = 165.5;

    // --- CORNER VOID FILLER ---
    // This adds a wall at the very end of the X-axis to block the void where the player turns
    addBox(scene, 165.5 + 5.5, 5, 0, 1, 10, 11, createLabWallMaterial(), walls);
    addBox(scene, hallX - 5.5, 5, hallCenterZ + 7.5, 1, 10, hallLength + 15, createLabWallMaterial(), walls);
    addBox(scene, hallX + 5.5, 5, hallCenterZ, 1, 10, hallLength, createLabWallMaterial(), walls);
    addBox(scene, hallX, CEILING_HEIGHT, hallCenterZ + 7.5, 10, 1, hallLength + 15, createLabWallMaterial(), walls);
    addBox(scene, hallX, 5, -5.5, 11, 10, 1, createLabWallMaterial(), walls);
    addBox(scene, hallX, -1.5, 5, 11, 10, 1, createLabWallMaterial(), walls);
    addBox(scene, hallX, CEILING_HEIGHT, hallZStart, 10, 1, hallLength + 15, createLabWallMaterial(), walls);

    const spikeLen = 65;
    const safeLen = 15;

    const spikeZ = hallZStart + (spikeLen / 2);
    addBox(scene, hallX, 0, spikeZ, 10, 0.5, spikeLen, createMetalFloorMaterial(), collisionObjects);
    createSpikeArea(scene, new THREE.Vector3(hallX, 0, spikeZ), 9, spikeLen - 2);

    const safeZ = hallZStart + spikeLen + (safeLen / 2);
    addBox(scene, hallX, 0, safeZ, 10, 0.5, safeLen, createMetalFloorMaterial(), collisionObjects);

    // --- END OF HALLWAY VOID FILLER ---
    // Blocks the void if the player looks straight ahead at the end of the Z-hall
    addBox(scene, hallX, 5, safeZ - safeLen / 2 + 0.5, 11, 10, 1, createLabWallMaterial(), walls);




    // --- 4. PUZZLE ROOM (Turn Left towards +X) ---
    const roomX = 185;
    const roomZ = 65;

    const roomSize = 30;
    addBox(scene, roomX, 0, roomZ, roomSize, 0.5, TUNNEL_WIDTH, createMetalFloorMaterial(), collisionObjects);

    addBox(scene, roomX, CEILING_HEIGHT, roomZ, roomSize, 1, TUNNEL_WIDTH, createLabWallMaterial(), walls);
    addBox(scene, roomX, 5, roomZ - 5.5, roomSize, 10, 1, createLabWallMaterial(), walls);
    addBox(scene, roomX, 5, roomZ + 5.5, roomSize, 10, 1, createLabWallMaterial(), walls);

    // --- ROOM END WALL ---
    const endWall = addBox(scene, roomX + 15.5, 5, roomZ, 1, 10, TUNNEL_WIDTH + 1, createLabWallMaterial(), walls);
    scene.userData.endWall = endWall;

    // --- 5. PUZZLE ELEMENTS ---
    const puzzleBlock = new DraggableCube(scene, new THREE.Vector3(roomX - 5, 2, roomZ));
    const wallButtonPos = new THREE.Vector3(roomX + 14, 4, roomZ + 3);

    const ceilingPlatX = roomX + 5;
    const ceilingPlatY = 7;
    const ceilingPlatZ = roomZ;
    const ceilingPlat = addBox(scene, ceilingPlatX, ceilingPlatY, ceilingPlatZ, 6, 0.5, 6, createLabWallMaterial());
    collisionObjects.push(ceilingPlat);
    walls.push(ceilingPlat);

    const exitDoor = new Door(scene, new THREE.Vector3(roomX + 14, 2, roomZ));

    // Light bulb in puzzle room
    const bulb3 = createLightBulb(scene, new THREE.Vector3(roomX, 8, roomZ), 0xffff99);
    scene.userData.bulb3Glow = bulb3.glow;
    scene.userData.bulb3Light = bulb3.light;
    bulb3.glow.visible = false;
    bulb3.light.intensity = 0;

    const platformButton = new FloorButton(scene, new THREE.Vector3(ceilingPlatX, ceilingPlatY + 0.3, ceilingPlatZ), {
        open: () => {
            exitDoor.open();
            console.log("Door opening!");
        },
        close: () => {
            exitDoor.close();
            console.log("Door closing!");
        }
    });

    scene.userData.handlePlayerDeath = () => {
        if (!scene.userData.hasDied) {
            scene.userData.hasDied = true;
            if (scene.userData.ambientLight) scene.userData.ambientLight.intensity = 0.6;
            if (scene.userData.bulb1Glow) scene.userData.bulb1Glow.visible = true;
            if (scene.userData.bulb1) scene.userData.bulb1.light.intensity = 5;
        }
    };

    return {
        scene,
        walls,
        collisionObjects,
        puzzle: { cube: puzzleBlock, button: platformButton, door: exitDoor },
        spawnPoint: new THREE.Vector3(20, 5, 0)
    };
}

function addBox(scene, x, y, z, w, h, d, mat, colArray = null) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
    if (colArray) colArray.push(mesh);
    return mesh;
}



function createSpikeArea(scene, pos, lx, lz) {
    const spacing = 2;
    for (let x = -lx / 2; x < lx / 2; x += spacing) {
        for (let z = -lz / 2; z < lz / 2; z += spacing) {
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2, 8), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
            spike.position.set(pos.x + x, pos.y + 1, pos.z + z);
            scene.add(spike);
            scene.userData.spikes.push(spike);
        }
    }
}