import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createCamera, createLight } from "../utils/index.js";
import { createHumanEntity } from "../entities/index.js";
import { createPlane } from "../world/index.js";
import { SystemManager, InputSystem, PhysicsSystem } from "../systems/index.js";

export const createGameScene = (canvas) => {
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

    // Setup systems
    const systemManager = new SystemManager(entities);

    // InputSystem - handles all input
    const inputSystem = new InputSystem();
    systemManager.addSystem(inputSystem);

    // PhysicsSystem - handles gravity, collisions, ground detection
    const physicsSystem = new PhysicsSystem();
    systemManager.addSystem(physicsSystem);

    // Setup action mappings for input
    inputSystem.mapAction('moveForward', 'w');
    inputSystem.mapAction('moveBackward', 's');
    inputSystem.mapAction('moveLeft', 'a');
    inputSystem.mapAction('moveRight', 'd');
    inputSystem.mapAction('jump', ' ');

    // Inject InputSystem into MovementComponent
    const movement = humanEntity.getComponent('movement');
    if (movement) {
        movement.setInputSystem(inputSystem);
    }

    // Setup lighting
    const light = createLight();
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    // Setup world
    const { plane, buildings } = createPlane();
    scene.add(plane);

    // Configure PhysicsSystem with world data
    physicsSystem.setBuildings(buildings);
    physicsSystem.setGroundLevel(0.25); // GRID_HEIGHT / 2

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Setup camera controls
    const controls = new OrbitControls(currentCamera, renderer.domElement);
    controls.enableDamping = true; // Enable smooth camera movement
    controls.dampingFactor = 0.05;
    controls.target.copy(human.position);
    currentCamera.lookAt(human.position);

    // Game loop
    let prevTime = performance.now();
    const run = (now) => {
        const dt = (now - prevTime) / 1000;
        prevTime = now;

        // 1. Pre-update systems (input capture)
        systemManager.preUpdate(dt);

        // 2. Handle camera switching via InputSystem
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

        // 3. Handle jump via InputSystem
        if (inputSystem.wasKeyJustPressed(' ')) {
            const jumpComponent = humanEntity.getComponent('jump');
            if (jumpComponent) {
                jumpComponent.triggerJump(humanEntity);
            }
        }

        // 4. Update all entities (components handle their own logic)
        entities.forEach(entity => {
            entity.update(dt);
        });

        // 5. Post-update systems (none yet, reserved for future)
        systemManager.postUpdate(dt);

        // 6. Render
        // Update OrbitControls target to follow human
        controls.target.copy(human.position);

        // Update OrbitControls (required for damping and smooth movement)
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
