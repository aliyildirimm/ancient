import * as THREE from "three";
import { Entity } from "../../core/Entity.js";
import { PositionComponent, MovementComponent, RotationComponent, JumpComponent, PhysicsComponent } from "../../components/index.js";
import { AnimationController } from "../../controllers/index.js";
import { GRID_HEIGHT, SPEED, ROTATION_SPEED, JUMP_SPEED, MAX_AIR_JUMPS } from "../../utils/constants.js";
import { loadHumanoidModelWithAnimations } from "../../loaders/ModelLoader.js";

/**
 * Create a human entity from a loaded GLTF model
 * Uses model-based animations via AnimationController
 */
export const createHumanEntity = async (modelUrl) => {
  // Load the model with animations
  const { scene: humanMesh, animations } = await loadHumanoidModelWithAnimations(modelUrl);

  const humanEntity = new Entity("Player");
  humanEntity.setThreeObject(humanMesh);

  // Calculate bounding box to handle different model origins
  const bbox = new THREE.Box3().setFromObject(humanMesh);
  const modelHeight = bbox.max.y - bbox.min.y;
  const modelBottomOffset = bbox.min.y; // How far below origin the bottom is

  // Scale the model to make it bigger
  const modelScale = 1.5;
  humanMesh.scale.set(modelScale, modelScale, modelScale);

  const groundLevel = GRID_HEIGHT / 2;  // 0.25
  const scaledModelHeight = modelHeight * modelScale;

  // Position character well above ground so feet are visible
  // Add extra offset to ensure visibility
  const initialY = groundLevel + scaledModelHeight + 1.0;

  humanMesh.position.set(0, initialY, 0);
  humanMesh.rotation.y = Math.PI;

  const bottomOffset = scaledModelHeight / 2;

  humanEntity.addComponent("position", new PositionComponent(0, initialY, 0));
  const physicsComponent = new PhysicsComponent(1, true);
  physicsComponent.bottomOffset = bottomOffset;
  physicsComponent.colliderHeight = scaledModelHeight;  // Use scaled model height
  physicsComponent.isGrounded = true;
  physicsComponent.groundY = groundLevel;
  humanEntity.addComponent("physics", physicsComponent);
  humanEntity.addComponent("movement", new MovementComponent(SPEED));
  humanEntity.addComponent("rotation", new RotationComponent(Math.PI, ROTATION_SPEED));
  humanEntity.addComponent("jump", new JumpComponent(7, MAX_AIR_JUMPS));

  // Add animation controller with model and animations
  const animationController = new AnimationController(humanMesh, animations);
  humanEntity.addComponent("animation", animationController);

  return humanEntity;
};
