import * as THREE from "three";
import { Entity } from "../core/Entity.js";
import { PositionComponent, MovementComponent, RotationComponent, JumpComponent, PhysicsComponent } from "../components/index.js";
import { GRID_HEIGHT, SPEED, ROTATION_SPEED, JUMP_SPEED } from "../utils/constants.js";

function createHead(headY) {
    const headGeo = new THREE.SphereGeometry(0.3);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, headY, 0);

    // Eye geometry and material
    const eyeGeo = new THREE.SphereGeometry(0.05);
    const eyeMat = new THREE.MeshLambertMaterial({ color: 0x000000 });

    // Left eye
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.1, 0.05, 0.27); // small offset from center

    // Right eye
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.1, 0.05, 0.27);

    // Attach eyes to the head
    head.add(leftEye);
    head.add(rightEye);

    return head;
}

function createBody(bodyY, bodyW, bodyH, bodyD) {
  const bodyGeo = new THREE.BoxGeometry(bodyW, bodyH, bodyD);
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0, bodyY, 0);
  return body;
}

function createArms(bodyW, armsY, armAngle) {
  const group = new THREE.Group();

  const armH = 0.8;
  const armW = 0.25;
  const armD = 0.1;
  const armGeo = new THREE.BoxGeometry(armW, armH, armD);
  const armMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.position.set(-bodyW / 2 - armW / 2, armsY, 0);
  leftArm.rotation.z = -armAngle;

  const rightArm = new THREE.Mesh(armGeo, armMat.clone());
  rightArm.position.set(bodyW / 2 + armW / 2, armsY, 0);
  rightArm.rotation.z = armAngle;

  group.add(leftArm, rightArm);
  return group;
}

function createLegs(legsY) {
  const group = new THREE.Group();

  const legH = 1.0;
  const legW = 0.4;
  const legD = 0.1;
  const legGeo = new THREE.BoxGeometry(legW, legH, legD);
  const legMat = new THREE.MeshLambertMaterial({ color: 0x3333ff });

  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-0.25, legsY, 0);

  const rightLeg = new THREE.Mesh(legGeo, legMat.clone());
  rightLeg.position.set(0.25, legsY, 0);

  group.add(leftLeg, rightLeg);
  return group;
}

/**
 * Creates the Three.js visual representation of a human
 */
function createHumanMesh() {
  const human = new THREE.Group();

  const bodyH = 1.2;
  const bodyW = 1.0;
  const bodyD = 0.5;
  const legH = 1.0;
  const headH = 0.4;
  const hipGap = 0.2;
  const neckGap = 0.1;
  const armAngle = THREE.MathUtils.degToRad(30);

  const legsY = -legH / 2;
  const bodyY = hipGap + bodyH / 2;
  const headY = bodyY + bodyH / 2 + neckGap + headH / 2;
  const armsY = bodyY + 0.1;

  const body = createBody(bodyY, bodyW, bodyH, bodyD);
  const head = createHead(headY);
  const arms = createArms(bodyW, armsY, armAngle);
  const legs = createLegs(legsY);

  human.add(body, head, arms, legs);

  return human;
}

/**
 * Creates a HumanEntity using the entity system
 * This is the new way - using components for behavior
 */
export const createHumanEntity = () => {
  // Create the entity
  const humanEntity = new Entity("Player");
  
  // Create the visual representation
  const humanMesh = createHumanMesh();
  humanEntity.setThreeObject(humanMesh);
  
  // Calculate bottom offset: legs are at -0.5, each leg is 1.0 tall, so bottom is at -1.0 from center
  const bottomOffset = 1.0;
  
  // Set initial position so bottom of human is at ground level
  const groundLevel = GRID_HEIGHT / 2; // 0.25
  const initialY = groundLevel + bottomOffset; // Position center so bottom is at ground
  humanMesh.position.set(0, initialY, 0);
  humanMesh.rotation.y = Math.PI; // Face forward (back to camera initially)
  
  // Add components (abilities)
  humanEntity.addComponent("position", new PositionComponent(0, initialY, 0));
  const physicsComponent = new PhysicsComponent(1, true); // mass=1, useGravity=true
  physicsComponent.bottomOffset = bottomOffset; // Set the bottom offset for ground detection
  // Initialize as grounded since we're starting on the ground
  physicsComponent.isGrounded = true;
  physicsComponent.groundY = groundLevel;
  humanEntity.addComponent("physics", physicsComponent);
  humanEntity.addComponent("movement", new MovementComponent(SPEED));
  humanEntity.addComponent("rotation", new RotationComponent(Math.PI, ROTATION_SPEED));
  humanEntity.addComponent("jump", new JumpComponent(7)); // jumpForce=7 (upward velocity)
  
  return humanEntity;
};

/**
 * Legacy function - kept for backwards compatibility
 * But now it just creates the mesh, not the full entity
 */
export const createHuman = () => {
  return createHumanMesh();
};
