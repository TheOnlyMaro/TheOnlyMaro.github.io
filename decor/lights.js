import * as THREE from 'three';

export function setupLights(scene, floorSize, wallHeight) {
    // --- Ambient Light --- (darker now)
    // const ambient = new THREE.AmbientLight(0xffffff, 0.15); // very soft general illumination
    // scene.add(ambient);

    // --- Spot Lights (ceiling lights) ---
    const spot1 = new THREE.SpotLight(0x88ccff, 1.2); // slightly dimmer
    spot1.position.set(floorSize / 4, wallHeight - 0.1, floorSize / 4);
    spot1.angle = Math.PI / 6;
    spot1.penumbra = 0.3;
    spot1.castShadow = true;
    scene.add(spot1);

    const spot2 = new THREE.SpotLight(0xffaa88, 1.0); // slightly dimmer
    spot2.position.set(-floorSize / 4, wallHeight - 0.1, -floorSize / 4);
    spot2.angle = Math.PI / 6;
    spot2.penumbra = 0.3;
    spot2.castShadow = true;
    scene.add(spot2);

    // --- Emissive panels in four corners ---
    const panelGeometry = new THREE.BoxGeometry(1, 0.1, 1);
    const panelMaterialBlue = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5, // slightly lower glow
        metalness: 0.5,
        roughness: 0.2
    });
    const panelMaterialOrange = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xffaa00,
        emissiveIntensity: 0.5,
        metalness: 0.5,
        roughness: 0.2
    });

    const positions = [
        [floorSize / 2 - 1, 0.05, floorSize / 2 - 1],
        [-floorSize / 2 + 1, 0.05, floorSize / 2 - 1],
        [floorSize / 2 - 1, 0.05, -floorSize / 2 + 1],
        [-floorSize / 2 + 1, 0.05, -floorSize / 2 + 1]
    ];

    positions.forEach((pos, i) => {
        const material = i % 2 === 0 ? panelMaterialBlue : panelMaterialOrange;
        const panel = new THREE.Mesh(panelGeometry, material);
        panel.position.set(pos[0], pos[1], pos[2]);
        panel.castShadow = false;
        panel.receiveShadow = false;
        scene.add(panel);

        // Optional subtle point light to enhance glow
        const glow = new THREE.PointLight(material.emissive.getHex(), 0.2, 5); // slightly dimmer
        glow.position.set(pos[0], pos[1] + 0.05, pos[2]);
        scene.add(glow);
    });

    return { ambient, spot1, spot2 };
}

export function createLightBulb(scene, pos, color) {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 2 }));
    bulb.position.copy(pos);
    const light = new THREE.PointLight(color, 2, 50);
    light.position.copy(pos);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(1.2), new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.2 }));
    glow.position.copy(pos);
    scene.add(bulb, light, glow);
    return { bulb, light, glow };
}

export function setupLevelThreeLights(scene) {
    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    scene.userData.ambientLight = ambientLight;

    const bulb1 = createLightBulb(scene, new THREE.Vector3(75, 8, 0), 0xffff99);
    bulb1.glow.visible = false;
    scene.userData.bulb1Glow = bulb1.glow;
    scene.userData.bulb1 = bulb1; // Store reference for dynamic control in level logic

    // bulb2 - just a static light in the second hall
    createLightBulb(scene, new THREE.Vector3(165.5, 8, 77.5), 0xffff99);
}