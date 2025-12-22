import * as THREE from 'three';
import { createWalls } from '../obstacles/walls.js';
import { createFloor, createCeiling } from '../decor/floor_ceiling.js';

export function buildCorridor(length = 80, width = 10, height = 10, options = { openEnds: true }) {
    const corridor = new THREE.Group();

    // Floor
    const floorSize = width;
    const floor = createFloor(floorSize);
    floor.scale.z = length / width;
    corridor.add(floor);

    // Ceiling
    const ceiling = createCeiling(floorSize, height);
    ceiling.scale.z = length / width;
    corridor.add(ceiling);

    // Walls
    const allWalls = createWalls(floorSize, height);

    // We scale the side walls (left and right)
    allWalls[2].scale.z = length / width; // Left
    allWalls[3].scale.z = length / width; // Right

    corridor.add(allWalls[2]);
    corridor.add(allWalls[3]);

    // If NOT openEnds, add the front and back caps
    if (!options.openEnds) {
        // These would need to be moved to the ends of the corridor if scale wasn't used, 
        // but since we scale the whole group or the individual walls, 
        // it's easier to just skip them for a "tube".
    }

    // Return the group and only the active walls for collision
    return { corridor, walls: [allWalls[2], allWalls[3]] };
}
