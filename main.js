import * as THREE from 'three';
import fragment from './shader/fragment.glsl';
import vertex from './shader/vertex.glsl';
import particleFragment from './shader/pfragment.glsl';
import particleVertex from './shader/pvertex.glsl';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const device = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: window.devicePixelRatio 
};

class DoubleFrameBuffer {
	constructor(length, vertexSrc, fragmentSrc) {
		this.size = length;
		this.buffer = new THREE.WebGLRenderTarget(length, length, {
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType
		});
		this.buffer1 = new THREE.WebGLRenderTarget(length, length, {
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType
		});
		this.scene = new THREE.Scene();
		this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
		this.camera.position.set(0, 0, 1);
		this.camera.lookAt(0, 0, 0);
		this.data = new Float32Array(4 * this.size * this.size);
		this.initPositions();

		this.texture = new THREE.DataTexture(
			this.data,
			this.size,
			this.size,
			THREE.RGBAFormat,
			THREE.FloatType,
		);
		this.texture.magFilter = THREE.NearestFilter;
		this.texture.minFilter = THREE.NearestFilter;
		this.texture.needsUpdate = true;

		this.material = new THREE.ShaderMaterial({
			uniforms: {
				positions: {value: this.texture},
				dt: {value: 0},
			},
			vertexShader: vertexSrc,
			fragmentShader: fragmentSrc
		});
		let quad = new THREE.PlaneGeometry(2, 2);
		this.mesh = new THREE.Mesh(quad, this.material);
		this.scene.add(this.mesh);
	}

	initPositions() {
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				let index = (i + j * this.size) * 4;
				let r = Math.random()
				let theta = 2 * Math.PI * Math.random()
				this.data[index] = r * Math.cos(theta);
				this.data[index + 1] = r * Math.sin(theta);
				this.data[index + 2] = 0;
				this.data[index + 3] = 1.0;
			}
		}
	}

	swapBuffers() {
		let temp = this.buffer;
		this.buffer = this.buffer1;
		this.buffer1 = temp;
	}
}

class App {
	constructor() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(
			75,
			device.width / device.height,
      		0.1,
      		100
		);
		
		this.numParts = 1500;
		this.size = Math.floor(Math.sqrt(this.numParts));


		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(device.width, device.height);
    	this.renderer.setPixelRatio(Math.min(device.pixelRatio, 2));
		this.frameBuffer = new DoubleFrameBuffer(this.size, particleVertex, particleFragment);
		this.setGeometry();

		this.clock = new THREE.Clock();
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.update()
		
		
	}

	setGeometry() {
		let count = this.frameBuffer.size * this.frameBuffer.size;
		let geometry = new THREE.BufferGeometry();
		let positions = new Float32Array(3 * count);
		let uv = new Float32Array(2 * count);
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				let index = i + j * this.size;
				uv[2 * index] = i / this.size;
				uv[2 * index + 1] = j / this.size;

			}
		}
		geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
		geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
		this.texture = new THREE.ShaderMaterial({
			uniforms: {
				positions: {value: positions}
			},
			side: THREE.DoubleSide,
			fragmentShader: fragment,
			vertexShader: vertex
		});
		this.points = new THREE.Points(geometry, this.texture);
		this.scene.add(this.points);
	}

	render() {
		requestAnimationFrame( () => this.render() );
		this.frameBuffer.material.uniforms.dt.value = this.clock.getDelta();
		// Set render target to buffer
		this.renderer.setRenderTarget(this.frameBuffer.buffer);
		// Set positions to be rendered as the last output of last pass
		this.texture.uniforms.positions.value = this.frameBuffer.buffer.texture;
		// Render to buffer's output texture
		this.renderer.render(this.frameBuffer.scene, this.frameBuffer.camera);
		// Render scence
		this.renderer.setRenderTarget(null);
		this.renderer.render(this.scene, this.camera);
		// Swap output buffer
		this.frameBuffer.swapBuffers();
		// Set the positions to be read in the next pass to be 
		this.frameBuffer.material.uniforms.positions.value = this.frameBuffer.buffer1.texture;

		this.controls.update()


	}
}

const app = new App();
document.body.appendChild( app.renderer.domElement );

app.camera.position.z = 2;
app.render();