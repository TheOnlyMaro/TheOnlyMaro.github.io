import * as THREE from 'three';

export function loadLevel(scene) {
    const textureLoader = new THREE.TextureLoader();

    // Load Textures
    const floorTexture = textureLoader.load('./textures/floor_grid.png');
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);

    const wallTexture = textureLoader.load('./textures/metal_wall.png');
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(4, 2);

    const lightTexture = textureLoader.load('./textures/light_panel.png');

    // Materials
    const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });
    const wallMaterial = new THREE.MeshStandardMaterial({ map: wallTexture });
    const lightMaterial = new THREE.MeshBasicMaterial({ map: lightTexture });

    const colliders = [];

    // --- Geometry ---

    // 1. Main Floor
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        floorMaterial
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    // Floor collider (prevent falling below y=0, handled by camera controller currently, but good to have)
    // colliders.push(floor); 

    // 2. Walls (Perimeter)
    const wallHeight = 10;
    const wallGeo = new THREE.BoxGeometry(50, wallHeight, 1);

    // Back Wall
    const backWall = new THREE.Mesh(wallGeo, wallMaterial);
    backWall.position.set(0, wallHeight / 2, -25);
    scene.add(backWall);
    colliders.push(backWall);

    // Front Wall
    const frontWall = new THREE.Mesh(wallGeo, wallMaterial);
    frontWall.position.set(0, wallHeight / 2, 25);
    scene.add(frontWall);
    colliders.push(frontWall);

    // Left Wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, wallHeight, 50), wallMaterial);
    leftWall.position.set(-25, wallHeight / 2, 0);
    scene.add(leftWall);
    colliders.push(leftWall);

    // Right Wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, wallHeight, 50), wallMaterial);
    rightWall.position.set(25, wallHeight / 2, 0);
    scene.add(rightWall);
    colliders.push(rightWall);

    // 3. Platform & Ramp
    const platform = new THREE.Mesh(
        new THREE.BoxGeometry(10, 5, 10),
        wallMaterial
    );
    platform.position.set(-15, 2.5, -15);
    scene.add(platform);
    colliders.push(platform);

    const rampGeo = new THREE.BoxGeometry(10, 1, 15);
    const ramp = new THREE.Mesh(rampGeo, wallMaterial);
    // Position/Rotate to make a ramp up to the platform
    // Pivot at bottom? Easier to just create a rotated box.
    ramp.position.set(-15, 1.5, -2.5); // End of platform is at z=-10. Ramp needs to go from z=-10 to z=5 approx.
    ramp.rotation.x = -Math.PI / 6; // 30 degrees
    scene.add(ramp);
    colliders.push(ramp);

    // 4. Light Panel (Decoration)
    const lightPanel = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 2),
        lightMaterial
    );
    lightPanel.position.set(0, 5, -24.4); // On back wall
    scene.add(lightPanel);

    const checkLight = new THREE.PointLight(0x00aaff, 1, 20);
    checkLight.position.set(0, 5, -20);
    scene.add(checkLight);

    return colliders;
}
