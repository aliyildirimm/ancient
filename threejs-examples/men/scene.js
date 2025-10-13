import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createCamera, createLight, createPlane } from "./utils.js";
import { createHuman } from "./human.js";


const KEYS = { w: false, a: false, s: false, d: false };
const SPEED = 2;
const ROTATION_SPEED = 2;

// think of a circle.
// and 0 to 360 go in the counter clockwise
// then the angles would make sense
const TARGET_ROTATIONS = {
    w: Math.PI,
    s: 0,
    a: 3 * Math.PI / 2,
    d: Math.PI / 2
};

export const scene = (canvas) => {
    const scene = new THREE.Scene();

    const camera1 = createCamera(-2, 0, 5);
    const camera2 = createCamera(0, 0, 5);
    const camera3 = createCamera(2, 0, 5);
    scene.add(camera1, camera2, camera3);
    let currentCamera = camera2;

    const human = createHuman();
    scene.add(human);

    const light = createLight();
    scene.add(light);

    const plane = createPlane();
    scene.add(plane);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const controls = new OrbitControls(currentCamera, renderer.domElement);
    controls.update();

    const animate = () => {
        requestAnimationFrame(run);
    }

    // this is a main loop that iterates infinitely because of the recursive call.
    // we set the SPEED and rotation SPEED at the top of the file.
    // here what we do is, adjust the movements. 
    let prevTime = performance.now();
    const run = (now) => {
        const dt = (now - prevTime) / 1000;
        prevTime = now;

        // Movement
        if (KEYS.w) human.position.z -= SPEED * dt;
        if (KEYS.s) human.position.z += SPEED * dt;
        if (KEYS.a) human.position.x -= SPEED * dt;
        if (KEYS.d) human.position.x += SPEED * dt;

        console.log()

        // Rotation — just animate toward a target
        let targetRotation = human.rotation.y;
        const currentRotation = targetRotation;

        if (KEYS.w) targetRotation = TARGET_ROTATIONS.w; // forward
        if (KEYS.s) targetRotation = TARGET_ROTATIONS.s; // backward
        if (KEYS.a) targetRotation = TARGET_ROTATIONS.a; // left
        if (KEYS.d) targetRotation = TARGET_ROTATIONS.d; // right

        if(targetRotation - currentRotation !== 0) {
            human.rotation.y += (targetRotation - currentRotation) * dt * ROTATION_SPEED;
        }

        renderer.render(scene, currentCamera);
        requestAnimationFrame(run);
    }

    const handleKeyboardEvents = (event) => {
        if (event.type === "keydown"){
            const k = event.key.toLowerCase();
            if (k in KEYS) KEYS[k] = true;
        }
    
        if (event.type === "keyup"){
            const k = event.key.toLowerCase();
            if (k in KEYS) KEYS[k] = false;
        }
    }

    const handleCameraChangeEvent = (cameraIndex) => {
        if (cameraIndex === "1") {
            currentCamera = camera1
            controls.object = camera1;
        };
        if (cameraIndex === "2") {
            currentCamera = camera2;
            controls.object = camera2;
        };
        if (cameraIndex === "3") {
            currentCamera = camera3
            controls.object = camera3;
        };
    }

    return {
        animate,
        handleKeyboardEvents,
        handleCameraChangeEvent
    }
}
