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

    const humanEntity = createHumanEntity();
    const human = humanEntity.getThreeObject();
    scene.add(human);

    const entities = [humanEntity];
    const systemManager = new SystemManager(entities);

    const inputSystem = new InputSystem();
    const physicsSystem = new PhysicsSystem();
    systemManager.addSystem(inputSystem);
    systemManager.addSystem(physicsSystem);

    inputSystem.mapAction('moveForward', 'w');
    inputSystem.mapAction('moveBackward', 's');
    inputSystem.mapAction('moveLeft', 'a');
    inputSystem.mapAction('moveRight', 'd');
    inputSystem.mapAction('jump', ' ');

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

        systemManager.preUpdate(dt);

        if (inputSystem.wasKeyJustPressed('1')) {
            currentCamera = camera1;
            controls.object = camera1;
            controls.target.copy(human.position);
        } else if (inputSystem.wasKeyJustPressed('2')) {
            currentCamera = camera2;
            controls.object = camera2;
            controls.target.copy(human.position);
        } else if (inputSystem.wasKeyJustPressed('3')) {
            currentCamera = camera3;
            controls.object = camera3;
            controls.target.copy(human.position);
        }

        if (inputSystem.wasKeyJustPressed(' ')) {
            const jumpComponent = humanEntity.getComponent('jump');
            if (jumpComponent) {
                jumpComponent.triggerJump(humanEntity);
            }
        }

        entities.forEach(entity => {
            entity.update(dt);
        });

        systemManager.postUpdate(dt);

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
