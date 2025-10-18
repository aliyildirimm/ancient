import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createCamera, createLight } from "./utils.js";
import { createHuman } from "./human.js";
import { createPlane } from "./plane.js";
import { KEYS, SPEED, JUMP_SPEED, ROTATION_SPEED, TARGET_ROTATIONS, GRID_HEIGHT } from "./constants.js"

export const scene = (canvas) => {
    const scene = new THREE.Scene();

    const camera1 = createCamera(-15, 15, 15);
    const camera2 = createCamera(0, 15, 15);
    const camera3 = createCamera(15, 15, 15);
    scene.add(camera1, camera2, camera3);
    let currentCamera = camera2;

    const human = createHuman();
    // human should be appended directly at top of the tiles not some random value
    human.position.set(0, GRID_HEIGHT / 2 + 1, 0);
    // I ADDED this to see back of the human
    human.rotation.y = Math.PI;


    scene.add(human);

    const light = createLight();
    scene.add(light);

    const plane = createPlane();
    scene.add(plane);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const controls = new OrbitControls(currentCamera, renderer.domElement);


    currentCamera.lookAt(human.position);
    const animate = () => {
        requestAnimationFrame(run);
    }

    const targetHeight = 2;
    // this is a main loop that iterates infinitely because of the recursive call.
    // we set the SPEED and rotation SPEED at the top of the file.
    // here what we do is, adjust the movements. 

    // above comment was wrong:
    // this is the correct definition of this loop:
    // This only requests the browser to call your callback before the next rendering loop:
    // It requests the browser to call a user-supplied callback function before the next repaint.

    let prevTime = performance.now();
    const run = (now) => {
        const dt = (now - prevTime) / 1000;
        prevTime = now;

        // Movement
        if (KEYS.w) human.position.z -= SPEED * dt;
        if (KEYS.s) human.position.z += SPEED * dt;
        if (KEYS.a) human.position.x -= SPEED * dt;
        if (KEYS.d) human.position.x += SPEED * dt;

        // Rotation — just animate toward a target
        let targetRotation = human.rotation.y;
        const currentRotation = targetRotation;

        if (KEYS.w) targetRotation = TARGET_ROTATIONS.w; // forward
        if (KEYS.s) targetRotation = TARGET_ROTATIONS.s; // backward
        if (KEYS.a) targetRotation = TARGET_ROTATIONS.a; // left
        if (KEYS.d) targetRotation = TARGET_ROTATIONS.d; // right

        let diff = targetRotation - currentRotation; 
        if(diff !== 0) {
            if (Math.abs(diff) > Math.PI) {
                if (diff > 0) {
                    diff = diff - (2 * Math.PI)
                } else {
                    diff = diff + (2 * Math.PI)
                }
            }
            
            human.rotation.y += diff * dt * ROTATION_SPEED;
        }

        // how far above / behind you want the camera
        const height = 10;
        const distance = -10;
        const offset = new THREE.Vector3(0, height, distance);

        // rotate the offset by human's current rotation
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), human.rotation.y);

        // place the camera relative to the human
        currentCamera.position.copy(human.position).add(offset);
        currentCamera.lookAt(human.position);
        renderer.render(scene, currentCamera);
        requestAnimationFrame(run);
    }

    const handleKeyboardEvents = (event) => {
        let k = event.key.toLowerCase();
        if (event.type === "keydown"){
            if (k in KEYS) KEYS[k] = true;
        }
    
        if (event.type === "keyup"){
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

    const jump = () => {
        human.position.y += JUMP_SPEED;
        if(targetHeight - human.position.y <= 0) {
            jumpDown();
            return;
        }

        requestAnimationFrame(jump);
    }

    const jumpDown = () => {
        human.position.y = human.position.y - JUMP_SPEED;
        if (human.position.y <= 0) {
            return;
        } 

        requestAnimationFrame(jumpDown);
    }

    return {
        animate,
        handleKeyboardEvents,
        handleCameraChangeEvent,
        jump
    }
}
