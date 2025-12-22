import * as THREE from 'three';
import { createWalls } from '../obstacles/walls.js';
import { createFloor, createCeiling } from '../decor/floor_ceiling.js';

export function buildRoom(size = 40, height = 10, options = {
    showBack: true,
    showFront: true,
    showLeft: true,
    showRight: true
}) {
    const room = new THREE.Group();

    // Floor
    const floor = createFloor(size);
    room.add(floor);

    // Ceiling
    const ceiling = createCeiling(size, height);
    room.add(ceiling);

    // Walls
    const allWalls = createWalls(size, height);
    // walls are usually returned as [back, front, left, right] based on createWalls implementation
    if (options.showBack) room.add(allWalls[0]);
    if (options.showFront) room.add(allWalls[1]);
    if (options.showLeft) room.add(allWalls[2]);
    if (options.showRight) room.add(allWalls[3]);

    return {
        room, walls: allWalls.filter((_, i) => {
            if (i === 0) return options.showBack;
            if (i === 1) return options.showFront;
            if (i === 2) return options.showLeft;
            if (i === 3) return options.showRight;
            return false;
        })
    };
}
