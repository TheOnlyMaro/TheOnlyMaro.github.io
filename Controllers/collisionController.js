import * as THREE from 'three';

export class CollisionController {
  constructor(player, walls) {
    this.player = player;       // THREE.Object3D of the player
    this.walls = walls;         // Array of THREE.Mesh walls

    // Precompute bounding boxes for walls
    this.wallBoxes = this.walls.map(wall => {
      const box = new THREE.Box3().setFromObject(wall);
      return box;
    });

    // Player collision box size
    this.playerBox = new THREE.Box3();
  }

  update() {
    // Update player bounding box
    this.playerBox.setFromCenterAndSize(
      this.player.position,
      new THREE.Vector3(1, 3, 1) // width, height, depth of player
    );

    // Check collision with each wall
    for (let wallBox of this.wallBoxes) {
      if (this.playerBox.intersectsBox(wallBox)) {
        // Simple collision response: stop the player
        // Could be improved with sliding along wall
        this.player.position.sub(this.player.position.clone().sub(this.player.prevPosition));
        break;
      }
    }

    // Store current position for next frame
    this.player.prevPosition = this.player.position.clone();
  }
}
