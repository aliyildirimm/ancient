import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createCamera, createLight } from "./utils.js";
import { createHumanEntity } from "./human.js";
import { createPlane } from "./plane.js";
import { KEYS } from "./constants.js";

export const scene = (canvas) => {
    const scene = new THREE.Scene();

    // Setup cameras
    const camera1 = createCamera(-15, 15, 15);
    const camera2 = createCamera(0, 15, 15);
    const camera3 = createCamera(15, 15, 15);
    scene.add(camera1, camera2, camera3);
    let currentCamera = camera2;

    // Create human entity using entity system
    const humanEntity = createHumanEntity();
    const human = humanEntity.getThreeObject(); // Get the Three.js object
    scene.add(human);

    // Store all entities (for easy expansion later)
    const entities = [humanEntity];

    // Setup lighting
    const light = createLight();
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    // Setup world
    const plane = createPlane();
    scene.add(plane);

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Setup camera controls
    const controls = new OrbitControls(currentCamera, renderer.domElement);
    currentCamera.lookAt(human.position);

    // Game loop
    let prevTime = performance.now();
    const run = (now) => {
        const dt = (now - prevTime) / 1000;
        prevTime = now;

        // Update all entities (components handle their own logic)
        entities.forEach(entity => {
            entity.update(dt);
        });

        // Camera follows human
        const height = 10;
        const distance = -10;
        const offset = new THREE.Vector3(0, height, distance);
        
        // Rotate offset by human's rotation
        const rotation = humanEntity.getComponent('rotation');
        if (rotation) {
            offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation.getRotation());
        } else {
            offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), human.rotation.y);
        }

        // Position camera relative to human
        currentCamera.position.copy(human.position).add(offset);
        currentCamera.lookAt(human.position);
        
        renderer.render(scene, currentCamera);
        requestAnimationFrame(run);
    }

    const animate = () => {
        requestAnimationFrame(run);
    }

    // Keyboard input handling
    const handleKeyboardEvents = (event) => {
        let k = event.key.toLowerCase();
        
        if (event.type === "keydown") {
            if (k in KEYS) KEYS[k] = true;
        }
    
        if (event.type === "keyup") {
            if (k in KEYS) KEYS[k] = false;
        }

        // Update movement component with key states
        const movement = humanEntity.getComponent('movement');
        if (movement) {
            movement.setKeyState(k, event.type === "keydown");
        }
    }

    // Camera switching
    const handleCameraChangeEvent = (cameraIndex) => {
        if (cameraIndex === "1") {
            currentCamera = camera1;
            controls.object = camera1;
        } else if (cameraIndex === "2") {
            currentCamera = camera2;
            controls.object = camera2;
        } else if (cameraIndex === "3") {
            currentCamera = camera3;
            controls.object = camera3;
        }
    }

    // Jump handling
    const jump = () => {
        const jumpComponent = humanEntity.getComponent('jump');
        if (jumpComponent) {
            jumpComponent.triggerJump(humanEntity);
        }
    }

    return {
        animate,
        handleKeyboardEvents,
        handleCameraChangeEvent,
        jump
    }
}
