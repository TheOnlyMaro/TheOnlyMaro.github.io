import * as THREE from 'three';
import { DraggableCube, FloorButton, Door } from '../puzzle_logic/PuzzleObjects.js';
import { createLabWallMaterial, createMetalFloorMaterial } from '../textures/materials_TextureMapping.js';

export function setupScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); 

    const walls = [];
    const collisionObjects = [];
    scene.userData.spikes = [];

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); 
    scene.add(ambientLight);
    scene.userData.ambientLight = ambientLight;

    // --- CONSTANTS ---
    const TUNNEL_WIDTH = 10;
    const CEILING_HEIGHT = 10; // Global ceiling Y position
    const WALL_THICKNESS = 1;

    // --- HELPER: BUILD FULL TUNNEL SECTION ---
    // Creates Floor, Ceiling, Left Wall, Right Wall automatically
    function createTunnel(x, yFloor, z, length, isPit = false) {
        // 1. Floor
        const floor = addBox(scene, x, yFloor, z, length, 0.5, TUNNEL_WIDTH, createMetalFloorMaterial());
        collisionObjects.push(floor);

        // 2. Ceiling (Always at global height 10)
        // Note: The ceiling thickness creates a "cap"
        addBox(scene, x, CEILING_HEIGHT, z, length, 1, TUNNEL_WIDTH, createLabWallMaterial(), walls);

        // 3. Walls
        // Height needs to span from Floor to Ceiling
        const wallHeight = CEILING_HEIGHT - yFloor; 
        const wallY = yFloor + (wallHeight / 2); // Center point of wall

        // Left Wall
        addBox(scene, x, wallY, z - (TUNNEL_WIDTH/2) - 0.5, length, wallHeight, WALL_THICKNESS, createLabWallMaterial(), walls);
        // Right Wall
        addBox(scene, x, wallY, z + (TUNNEL_WIDTH/2) + 0.5, length, wallHeight, WALL_THICKNESS, createLabWallMaterial(), walls);

        return floor;
    }

    // --- 1. STARTING CORRIDOR (X: 0 to 80) ---
    // A standard hallway
    createTunnel(40, 0, 0, 80);

    // Start Button
    const ambientButton = new FloorButton(scene, new THREE.Vector3(2, 0.3, 0), {
        open: () => {
            scene.userData.ambientLight.intensity = 0.6;
            if (scene.userData.bulb1Glow) scene.userData.bulb1Glow.visible = true;
        }
    });

    // Bulb 1
    const bulb1 = createLightBulb(scene, new THREE.Vector3(75, 8, 0), 0xffff99);
    scene.userData.bulb1Glow = bulb1.glow;
    bulb1.glow.visible = false;


    // --- 2. THE PIT AREA (X: 80 to 160) ---
    // Floor drops to Y = -8, but Ceiling stays at Y = 10
    const pitY = -8;
    const pitLength = 80;
    const pitCenterX = 120; // 80 + 40

    // We build the "Shell" of the pit (Walls and Ceiling) manually to cover the gap
    // Ceiling
    addBox(scene, pitCenterX, CEILING_HEIGHT, 0, pitLength, 1, TUNNEL_WIDTH, createLabWallMaterial(), walls);
    // Left High Wall
    addBox(scene, pitCenterX, 1, -5.5, pitLength, 18, 1, createLabWallMaterial(), walls);
    // Right High Wall
    addBox(scene, pitCenterX, 1, 5.5, pitLength, 18, 1, createLabWallMaterial(), walls);

    // -- PIT FLOOR SECTIONS --
    
    // A. The Spike Pit Floor (Unwalkable death zone)
    // We add a floor, but we cover it in spikes.
    // X: 80 to 130 (Length 50)
    const spikeFloorX = 105;
    const spikeFloorLen = 50;
    addBox(scene, spikeFloorX, pitY, 0, spikeFloorLen, 0.5, TUNNEL_WIDTH, createMetalFloorMaterial(), collisionObjects);
    
    // Add Spikes (Full Width!)
    // Spikes cover the floor we just made.
    createSpikeArea(scene, new THREE.Vector3(spikeFloorX, pitY, 0), spikeFloorLen - 5, TUNNEL_WIDTH - 1);

    // B. The Safe Landing (X: 130 to 145)
    // "Place after the spikes to stand on"
    const safeLandX = 137.5;
    const safeLandLen = 15;
    addBox(scene, safeLandX, pitY, 0, safeLandLen, 0.5, TUNNEL_WIDTH, createMetalFloorMaterial(), collisionObjects);

    // C. The Steps Up (X: 145 to 160)
    // Step 1
    addBox(scene, 148, pitY + 2.5, 0, 5, 1, TUNNEL_WIDTH, createMetalFloorMaterial(), collisionObjects);
    // Step 2
    addBox(scene, 153, pitY + 5.0, 0, 5, 1, TUNNEL_WIDTH, createMetalFloorMaterial(), collisionObjects);
    // Step 3 (Connects to next floor at Y=0)
    addBox(scene, 158, pitY + 7.5, 0, 5, 1, TUNNEL_WIDTH, createMetalFloorMaterial(), collisionObjects);


    // --- 3. CORRIDOR 2 (Turn Right) ---
    // X: 160, then Z grows.
    // Connector (X: 160 to 175)
    createTunnel(167.5, 0, 0, 15);

    // The Turn Joint (Corner)
    // We make a square room at 175,0,0
    createTunnel(175, 0, 0, 10); // Overlaps slightly, that's fine

    // The Z-Corridor (Z: 0 to 40)
    // X is fixed at 175.
    const c2Length = 40;
    const c2Z = 25; // Center Z
    
    // Manual Tunnel for Z-Axis
    addBox(scene, 175, 0, c2Z, TUNNEL_WIDTH, 0.5, c2Length, createMetalFloorMaterial(), collisionObjects); // Floor
    addBox(scene, 175, CEILING_HEIGHT, c2Z, TUNNEL_WIDTH, 1, c2Length, createLabWallMaterial(), walls); // Ceiling
    addBox(scene, 170.5, 5, c2Z, 1, 10, c2Length, createLabWallMaterial(), walls); // Left Wall (-X)
    addBox(scene, 179.5, 5, c2Z, 1, 10, c2Length, createLabWallMaterial(), walls); // Right Wall (+X)

    // Bulb 2
    createLightBulb(scene, new THREE.Vector3(175, 8, c2Z + 10), 0xffff99);


    // --- 4. PUZZLE ROOM (Turn Left towards +X) ---
    // At Z=45 (End of corridor 2), we turn +X.
    const roomX = 175 + 25; // 200
    const roomZ = 45;
    
    // Room Floor
    const roomSize = 30;
    addBox(scene, roomX, 0, roomZ, roomSize, 0.5, TUNNEL_WIDTH, createMetalFloorMaterial(), collisionObjects);
    
    // Room Walls/Ceiling
    addBox(scene, roomX, CEILING_HEIGHT, roomZ, roomSize, 1, TUNNEL_WIDTH, createLabWallMaterial(), walls);
    addBox(scene, roomX, 5, roomZ - 5.5, roomSize, 10, 1, createLabWallMaterial(), walls);
    addBox(scene, roomX, 5, roomZ + 5.5, roomSize, 10, 1, createLabWallMaterial(), walls);
    // End Wall
    addBox(scene, roomX + 15.5, 5, roomZ, 1, 10, TUNNEL_WIDTH, createLabWallMaterial(), walls);

    // --- 5. PUZZLE ELEMENTS ---
    const puzzleBlock = new DraggableCube(scene, new THREE.Vector3(roomX - 5, 2, roomZ));
    const wallButtonPos = new THREE.Vector3(roomX + 14, 4, roomZ + 3); // On the right wall effectively

    // >>> CEILING PLATFORM <<<
    // A platform hanging from the ceiling, accessible only by portal
    const ceilingPlatX = roomX + 5;
    const ceilingPlatY = 7;
    const ceilingPlatZ = roomZ;
    const ceilingPlat = addBox(scene, ceilingPlatX, ceilingPlatY, ceilingPlatZ, 6, 0.5, 6, createLabWallMaterial());
    collisionObjects.push(ceilingPlat);
    walls.push(ceilingPlat);

    // Button ON the ceiling platform (or wall near it)
    const platformButton = new FloorButton(scene, new THREE.Vector3(ceilingPlatX, ceilingPlatY + 0.3, ceilingPlatZ), {
        open: () => exitDoor.open(),
        close: () => exitDoor.close()
    });

    const exitDoor = new Door(scene, new THREE.Vector3(roomX + 14, 2, roomZ));

    // --- DEATH LOGIC ---
    scene.userData.handlePlayerDeath = () => {
        if (!scene.userData.hasDied) {
            scene.userData.hasDied = true;
            scene.userData.ambientLight.intensity = 0.6;
            if (scene.userData.bulb1Glow) scene.userData.bulb1Glow.visible = true;
            bulb1.light.intensity = 5; 
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

// --- HELPER FUNCTIONS ---

function addBox(scene, x, y, z, w, h, d, mat, colArray = null) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
    if (colArray) colArray.push(mesh);
    return mesh;
}

function createLightBulb(scene, pos, color) {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 2 }));
    bulb.position.copy(pos);
    const light = new THREE.PointLight(color, 2, 50);
    light.position.copy(pos);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(1.2), new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.2 }));
    glow.position.copy(pos);
    scene.add(bulb, light, glow);
    return { bulb, light, glow };
}

function createSpikeArea(scene, pos, lx, lz) {
    const spacing = 2; // Density of spikes
    // Loop covers the full area
    for (let x = -lx/2; x < lx/2; x += spacing) {
        for (let z = -lz/2; z < lz/2; z += spacing) {
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2, 8), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
            // +1 Y because cone origin is in center. Height is 2.
            spike.position.set(pos.x + x, pos.y + 1, pos.z + z);
            scene.add(spike);
            scene.userData.spikes.push(spike);
        }
    }
}