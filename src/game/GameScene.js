import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createCamera, createLight } from "../utils/index.js";
import { createHumanEntity } from "../entities/index.js";
import { createPlane } from "../world/index.js";
import { SystemManager, InputSystem, PhysicsSystem } from "../systems/index.js";

export const createGameScene = (canvas) => {
    const scene = new THREE.Scene();

    const camera1 = createCamera(-15, 15, 15);
    const camera2 = createCamera(0, 15, 15);
    const camera3 = createCamera(15, 15, 15);
    scene.add(camera1, camera2, camera3);
    let currentCamera = camera2;
    let currentCameraIndex = 1; // 0=left, 1=back, 2=right

    const humanEntity = createHumanEntity();
    const human = humanEntity.getThreeObject();
    scene.add(human);

    const entities = [humanEntity];
    const systemManager = new SystemManager(entities);

    const inputSystem = new InputSystem();
    const physicsSystem = new PhysicsSystem();
    systemManager.addSystem(inputSystem);
    systemManager.addSystem(physicsSystem);

    const movement = humanEntity.getComponent('movement');
    if (movement) {
        movement.setInputSystem(inputSystem);
    }

    const light = createLight();
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const { plane, buildings } = createPlane();
    scene.add(plane);

    physicsSystem.setBuildings(buildings);
    physicsSystem.setGroundLevel(0.25);

    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const controls = new OrbitControls(currentCamera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.copy(human.position);
    currentCamera.lookAt(human.position);

    let prevTime = performance.now();
    const run = (now) => {
        const dt = (now - prevTime) / 1000;
        prevTime = now;

        if (inputSystem.wasKeyJustPressed('1')) {
            currentCameraIndex = 0;
            currentCamera = camera1;
            controls.object = camera1;
        } else if (inputSystem.wasKeyJustPressed('2')) {
            currentCameraIndex = 1;
            currentCamera = camera2;
            controls.object = camera2;
        } else if (inputSystem.wasKeyJustPressed('3')) {
            currentCameraIndex = 2;
            currentCamera = camera3;
            controls.object = camera3;
        }

        if (inputSystem.wasKeyJustPressed(' ')) {
            const jumpComponent = humanEntity.getComponent('jump');
            if (jumpComponent) {
                jumpComponent.triggerJump(humanEntity);
            }
        }

        systemManager.preUpdate(dt);

        entities.forEach(entity => {
            entity.update(dt);
        });

        systemManager.postUpdate(dt);

        // Update camera position to follow character rotation
        const rotation = humanEntity.getComponent('rotation');
        if (rotation) {
            const charRotation = rotation.getRotation();
            const cameraDistance = 15;
            const cameraHeight = 15;

            // Define camera positions in character's local space
            // Character faces +Z in local space, so:
            // - Behind = -Z (negative Z direction in local space)
            // - Left = -X
            // - Right = +X
            const localCameraPositions = [
                { x: -15, z: -15 },  // Camera 1: Left-behind
                { x: 0, z: -15 },    // Camera 2: Directly behind
                { x: 15, z: -15 }    // Camera 3: Right-behind
            ];

            const cameras = [camera1, camera2, camera3];
            cameras.forEach((cam, idx) => {
                const localPos = localCameraPositions[idx];

                // Transform from local space to world space using character rotation
                const cos = Math.cos(charRotation);
                const sin = Math.sin(charRotation);

                const worldX = human.position.x + (localPos.x * cos - localPos.z * sin);
                const worldZ = human.position.z + (localPos.x * sin + localPos.z * cos);

                cam.position.set(worldX, cameraHeight, worldZ);
                cam.lookAt(human.position);
            });
        }

        controls.target.copy(human.position);
        controls.update();
        renderer.render(scene, currentCamera);
        requestAnimationFrame(run);
    }

    const animate = () => {
        requestAnimationFrame(run);
    }

    return {
        animate,
        systemManager,
        inputSystem
    }
}
