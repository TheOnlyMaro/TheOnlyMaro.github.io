import * as THREE from 'three';

export class PortalMesh {
  constructor(renderTarget) {
    // Geometry can be a simple plane - shader handles projection
    // We make it slightly larger to ensure coverage if oblique clipping misses edge
    const geometry = new THREE.PlaneGeometry(2, 3);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: renderTarget.texture },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        // Add an exposure/brightness multiplier uniform
        brightnessBoost: { value: 2.5 } // <--- Start with 2.0 or 2.5
      },
      vertexShader: `
        varying vec4 vClipPosition;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vClipPosition = gl_Position;
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform vec2 resolution;
        uniform float brightnessBoost; // <--- Use the uniform
        
        void main() {
          // Calculate screen UV coordinates (0..1)
          vec2 screenUV = gl_FragCoord.xy / resolution;
          
          // Sample the portal texture
          vec4 color = texture2D(map, screenUV);
          
          // --- LIGHTING FIX ---
          // Multiply the color to counteract double-tone-mapping or light loss.
          // Since this is a "window" (unlit), we control the emission directly.
          gl_FragColor = vec4(color.rgb * brightnessBoost, color.a);
        }
      `
    });

    // Stencil configuration
    material.stencilWrite = true;
    material.stencilFunc = THREE.EqualStencilFunc;
    material.stencilRef = 1;
    material.stencilFail = THREE.KeepStencilOp;
    material.stencilZFail = THREE.KeepStencilOp;
    material.stencilZPass = THREE.KeepStencilOp;
    material.side = THREE.DoubleSide;

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.renderOrder = 0; // Render after mask
  }

  setPositionAndOrientation(position, normal) {
    this.mesh.position.copy(position);

    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal
    );
    this.mesh.quaternion.copy(quaternion);

    // Offset
    const offset = normal.clone().multiplyScalar(0.02);
    this.mesh.position.add(offset);
  }

  setVisible(visible) {
    this.mesh.visible = visible;
  }

  // Update resolution uniform
  setSize(width, height) {
    this.mesh.material.uniforms.resolution.value.set(width, height);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}