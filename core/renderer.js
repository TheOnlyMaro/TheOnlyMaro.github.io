import * as THREE from 'three';

<<<<<<< HEAD
export function createRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    // 1. VIEWPORT TRANSFORMATION (from your notes)
    // This maps the normalized device coordinates to the window pixels (x,y).
=======
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.getElementById('game-container').appendChild(renderer.domElement);

// Handle window resize

function handleResize() {
>>>>>>> 2bd9727e2a0316ac7b7221bbf670d4749b683dbd
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