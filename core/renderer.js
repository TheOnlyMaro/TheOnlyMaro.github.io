import * as THREE from 'three';

export function createRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    // 1. VIEWPORT TRANSFORMATION (from your notes)
    // This maps the normalized device coordinates to the window pixels (x,y).
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // 2. ILLUMINATION & SHADING SUPPORT
    // You must enable this to support the "Lighting" step effectively later.
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows

    // Append to DOM
    document.body.appendChild(renderer.domElement);

    return renderer;
}