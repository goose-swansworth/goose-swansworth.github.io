import * as THREE from 'three';

export class DoubleFrameBuffer {
	constructor(length, shaderMaterial, renderer) {
		this.material = shaderMaterial;
		this.renderer = renderer;
		this.size = length;
		this.buffer = new THREE.WebGLRenderTarget(length, length, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			format: THREE.RGBAFormat,
			type: THREE.FloatType
		});
		this.buffer1 = new THREE.WebGLRenderTarget(length, length, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			format: THREE.RGBAFormat,
			type: THREE.FloatType
		});
		this.scene = new THREE.Scene();
		this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
		this.camera.position.set(0, 0, 1);
		this.camera.lookAt(0, 0, 0);
		let quad = new THREE.PlaneGeometry(2, 2);
		this.mesh = new THREE.Mesh(quad, this.material);
		this.scene.add(this.mesh);
	}


	swapBuffers() {
		let temp = this.buffer;
		this.buffer = this.buffer1;
		this.buffer1 = temp;
	}

	render() {
		// Set render target to buffer
		this.renderer.setRenderTarget(this.buffer);
		// Render to buffer's output texture
		this.renderer.render(this.scene, this.camera);
		// Reset render target
		this.renderer.setRenderTarget(null);
	}

}