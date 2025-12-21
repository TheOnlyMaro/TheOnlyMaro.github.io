import * as THREE from 'three';

export function createRenderer() {
    const renderer = new THREE.WebGLRenderer({antialias: true, stencil: true});
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return renderer;
}
