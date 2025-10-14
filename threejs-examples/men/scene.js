import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createCamera, createLight } from "./utils.js";
import { createHuman } from "./human.js";
import { createPlane } from "./plane.js";
import { KEYS, SPEED, JUMP_SPEED, ROTATION_SPEED, TARGET_ROTATIONS } from "./constants.js"

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

    const targetHeight = 2;
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
        // if (KEYS.space) { 
        //     while(targetHeight - human.position.y > 0) {
        //         human.position.y += JUMP_SPEED * dt;
        //     }
        // }

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
