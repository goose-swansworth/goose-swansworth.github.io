import * as THREE from 'three';
import fragment from './shader/fragment.glsl';
import vertex from './shader/vertex.glsl';
import particleFragment from './shader/pfragment.glsl';
import particleVertex from './shader/pvertex.glsl';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GUI } from 'dat.gui';
import { DoubleFrameBuffer } from './doubleframebuffer.js';

const device = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: window.devicePixelRatio 
};

const gui = new GUI();

let mouse = new THREE.Vector2();
let mouseWordCoords = new THREE.Vector2(-10, -10);
let attract = false;



function onMouseMove(event) {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	mouseWordCoords = app.getMouseWordCoords();
	//console.log(mouseWordCoords);	
}

function onMouseDown(event) {
	if (app.getIntersections().length > 0) {
		attract = !attract;
	}
	console.log(attract);
}

function createBoxPoints(boxSize, zOffset) {
	const points = [];
	points.push(new THREE.Vector3(-boxSize, -boxSize, zOffset-boxSize));
	points.push(new THREE.Vector3(boxSize, -boxSize, zOffset-boxSize));
	points.push(new THREE.Vector3(boxSize, -boxSize, zOffset+boxSize));
	points.push(new THREE.Vector3(-boxSize, -boxSize, zOffset+boxSize));
	points.push(new THREE.Vector3(-boxSize, -boxSize, zOffset-boxSize));

	points.push(new THREE.Vector3(-boxSize, boxSize, zOffset-boxSize));
	points.push(new THREE.Vector3(boxSize, boxSize, zOffset-boxSize));
	points.push(new THREE.Vector3(boxSize, boxSize, zOffset+boxSize));
	points.push(new THREE.Vector3(-boxSize, boxSize, zOffset+boxSize));
	points.push(new THREE.Vector3(-boxSize, boxSize, zOffset-boxSize));

	points.push(new THREE.Vector3(-boxSize, boxSize, zOffset+boxSize));
	points.push(new THREE.Vector3(-boxSize, -boxSize, zOffset+boxSize));
	points.push(new THREE.Vector3(boxSize, -boxSize, zOffset+boxSize));
	points.push(new THREE.Vector3(boxSize, boxSize, zOffset+boxSize));
	points.push(new THREE.Vector3(boxSize, boxSize, zOffset-boxSize));
	points.push(new THREE.Vector3(boxSize, -boxSize, zOffset-boxSize));
	return points;

}

class App {
	constructor() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(
			75,
			device.width / device.height,
      		0.1,
      		1000
		);
		
		this.numParts = 10000;
		this.particleSize = 500.0;
		this.size = Math.floor(Math.sqrt(this.numParts));
		this.sigma = 10;
		this.rho = 28;
		this.beta = 8/3;
		this.pointerRadius = 5.0;


		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setClearColor(0x222222);
		this.renderer.setSize(device.width, device.height);
    	this.renderer.setPixelRatio(Math.min(device.pixelRatio, 2));
		this.frameBuffer = new DoubleFrameBuffer(this.size, this.createLorenzShader(), this.renderer);
		this.setGeometry();

		this.clock = new THREE.Clock();
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.target = new THREE.Vector3(0, 0, this.rho - 1);
		this.controls.update()

		this.raycaster = new THREE.Raycaster();

		

		
		gui.add(this, "speed", 1, 2, 0.1).name("Speed up");
		gui.add(this, "particleSize", 100, 1000, 1).name("Particle Size");
		gui.add(this, "sigma", 0, 100, 0.1).name("Sigma");
		gui.add(this, "rho", 0, 100, 0.1).name("Rho");
		gui.add(this, "beta", 0, 100, 0.1).name("Beta");
		gui.add(this, "pointerRadius", 0, 100, 0.1).name("Radius");
		
		
	}

	loadTexture() {
		const texture = new THREE.TextureLoader().load("textures/circle_05.png");
		return texture;
	}

	createLorenzShader() {
		let data = new Float32Array(4 * this.size * this.size);
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				let index = (i + j * this.size) * 4;
				let r = 4 * Math.random()
				let theta = 2 * Math.PI * Math.random();
				data[index] = r * Math.cos(theta);
				data[index + 1] = r * Math.sin(theta);
				data[index + 2] = 0;
				data[index + 3] = 1.0;
			}
		}
		let texture = new THREE.DataTexture(
			data,
			this.size,
			this.size,
			THREE.RGBAFormat,
			THREE.FloatType,
		);
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;
		texture.needsUpdate = true;

		let material = new THREE.ShaderMaterial({
			uniforms: {
				positions: {value: texture},
				dt: {value: 0},
				time: {value: 0},
				mouse: {value: mouseWordCoords},
				attract: {value: attract},
				sigma: {value: null},
				rho: {value: null},
				beta: {value: null},
				pointerRadius: {value: null}	
			},
			vertexShader: particleVertex,
			fragmentShader: particleFragment
		});
		return material;
	}

	getIntersections() {
		this.camera.updateProjectionMatrix();
		this.raycaster.setFromCamera(mouse, this.camera);
		let intersections = new Array();
		this.mousePlane.raycast(this.raycaster, intersections);
		return intersections;
	}

	getMouseWordCoords() {
		let intersections = this.getIntersections();
		if (intersections.length > 0) {
			return new THREE.Vector2(intersections[0].point.x, intersections[0].point.y);
		}
		return mouseWordCoords; 
	}

	setGeometry() {
		const lineMaterial = new THREE.LineBasicMaterial({color: 0x888888, linewidth: 20})
		const zOffset = this.rho - 1;
		const boxSize = 25;
		const points = createBoxPoints(boxSize, zOffset);
		const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
		const boundingBox = new THREE.Line(lineGeometry, lineMaterial);
		this.scene.add(boundingBox);

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
				positions: {value: positions},
				lastPositions: {value: positions},
				time: {value: null},
				particleSize: {value: this.particleSize},
				camera: {value: this.camera.position},
				particleTexture: {value: this.loadTexture()}
			},
			side: THREE.DoubleSide,
			depthTest: false,
			transparent: true,
			blending: THREE.AdditiveBlending,
			fragmentShader: fragment,
			vertexShader: vertex
		});
		this.points = new THREE.Points(geometry, this.texture);
		this.scene.add(this.points);

		// Plane to raycast to
		this.mousePlane = new THREE.Mesh(new THREE.PlaneGeometry(2*boxSize, 2*boxSize), new THREE.MeshBasicMaterial());
		this.speed = 1.0;
	}

	render() {
		requestAnimationFrame( () => this.render() );
		this.frameBuffer.material.uniforms.mouse.value = mouseWordCoords;
		this.frameBuffer.material.uniforms.attract.value = attract;
		this.frameBuffer.material.uniforms.dt.value = this.speed * this.clock.getDelta();
		this.frameBuffer.material.uniforms.time.value = this.clock.getElapsedTime();
		this.frameBuffer.material.uniforms.sigma.value = this.sigma;
		this.frameBuffer.material.uniforms.rho.value = this.rho;
		this.frameBuffer.material.uniforms.beta.value = this.beta;
		this.frameBuffer.material.uniforms.pointerRadius.value = this.pointerRadius;
		
		// Set positions to be rendered as the last output of last pass
		this.texture.uniforms.lastPositions.value = this.frameBuffer.buffer.texture1;
		this.texture.uniforms.positions.value = this.frameBuffer.buffer.texture;
		this.texture.uniforms.time.value = this.clock.getElapsedTime();
		this.texture.uniforms.particleSize.value = this.particleSize;
		this.texture.uniforms.camera.value = this.camera.position;

		// Compute new particle positions
		this.frameBuffer.render();
		
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
document.addEventListener('mousemove', onMouseMove, false);
// document.addEventListener('mouseup', onMouseUp, false);
document.addEventListener('mousedown', onMouseDown, false);

app.camera.position.z = 100;
app.render();