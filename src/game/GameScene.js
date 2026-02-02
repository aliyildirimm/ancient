import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createCamera, createLight } from "../utils/index.js";
import { createHumanEntity } from "../entities/index.js";
import { createPlane } from "../world/index.js";
import { SystemManager, InputSystem, PhysicsSystem } from "../systems/index.js";

export const createGameScene = (canvas) => {
    const scene = new THREE.Scene();

    const camera = createCamera(0, 15, 15);
    scene.add(camera);

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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.copy(human.position);
    camera.lookAt(human.position);

    let prevTime = performance.now();
    const run = (now) => {
        const dt = (now - prevTime) / 1000;
        prevTime = now;

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

        // Update camera position to follow character
        const rotation = humanEntity.getComponent('rotation');
        if (rotation) {
            const charRotation = rotation.getRotation();
            const cameraDistance = 15;
            const cameraHeight = 15;

            // Position camera behind character
            const cos = Math.cos(charRotation);
            const sin = Math.sin(charRotation);

            const worldX = human.position.x - (cameraDistance * sin);
            const worldZ = human.position.z - (cameraDistance * cos);

            camera.position.set(worldX, cameraHeight, worldZ);
            camera.lookAt(human.position);
        }

        controls.target.copy(human.position);
        controls.update();
        renderer.render(scene, camera);
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
