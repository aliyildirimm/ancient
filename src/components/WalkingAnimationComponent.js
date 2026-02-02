/**
 * Walking Animation Component
 * Handles procedural walking animation with three states: idle, walking, jumping
 * Arms and legs swing based on movement speed and jump state
 */
import {
    ARM_SWING_AMPLITUDE,
    LEG_SWING_AMPLITUDE,
    IDLE_SWAY_AMPLITUDE,
    WALK_ANIMATION_FREQUENCY,
    IDLE_ANIMATION_FREQUENCY,
    JUMP_PULL_UP_DURATION
} from "../utils/constants.js";

export class WalkingAnimationComponent {
    constructor() {
        this.animationTime = 0;
        this.currentState = 'idle'; // 'idle', 'walking', 'jumping'
        this.jumpStartTime = 0;
        this.isJumping = false;

        // References to limb meshes (set by HumanEntity)
        this.leftArm = null;
        this.rightArm = null;
        this.leftLeg = null;
        this.rightLeg = null;

        // Store initial rotations
        this.initialArmRotation = { left: 0, right: 0 };
        this.initialLegRotation = { left: 0, right: 0 };
    }

    /**
     * Set limb mesh references
     */
    setLimbs(leftArm, rightArm, leftLeg, rightLeg) {
        this.leftArm = leftArm;
        this.rightArm = rightArm;
        this.leftLeg = leftLeg;
        this.rightLeg = rightLeg;

        // Store initial rotations (X axis for arms and legs - forward/backward swing)
        if (this.leftArm) this.initialArmRotation.left = this.leftArm.rotation.x;
        if (this.rightArm) this.initialArmRotation.right = this.rightArm.rotation.x;
        if (this.leftLeg) this.initialLegRotation.left = this.leftLeg.rotation.x;
        if (this.rightLeg) this.initialLegRotation.right = this.rightLeg.rotation.x;
    }

    update(deltaTime, entity) {
        if (!this.leftArm || !this.rightArm || !this.leftLeg || !this.rightLeg) return;

        this.animationTime += deltaTime;

        // Determine current state
        const movement = entity.getComponent('movement');
        const physics = entity.getComponent('physics');
        const rotation = entity.getComponent('rotation');

        // Check if moving (W or S pressed)
        const isMoving = movement &&
            (movement.inputSystem?.isKeyPressed('w') ||
             movement.inputSystem?.isKeyPressed('s'));

        // Check if jumping (not grounded)
        const isJumping = physics && !physics.isGrounded;

        // Update state
        if (isJumping) {
            this.currentState = 'jumping';
            if (!this.isJumping) {
                this.isJumping = true;
                this.jumpStartTime = this.animationTime;
            }
        } else {
            this.isJumping = false;
            this.currentState = isMoving ? 'walking' : 'idle';
        }

        // Apply animation based on state
        if (this.currentState === 'jumping') {
            this._updateJumpAnimation();
        } else if (this.currentState === 'walking') {
            this._updateWalkingAnimation(movement?.speed || 2);
        } else {
            this._updateIdleAnimation();
        }
    }

    /**
     * Idle animation: subtle sway
     */
    _updateIdleAnimation() {
        const frequency = IDLE_ANIMATION_FREQUENCY;
        const amplitude = IDLE_SWAY_AMPLITUDE;

        const sway = Math.sin(this.animationTime * frequency) * amplitude;

        // Subtle arm sway (forward-backward)
        this.leftArm.rotation.x = this.initialArmRotation.left - sway;
        this.rightArm.rotation.x = this.initialArmRotation.right + sway;

        // Legs stay mostly straight
        this.leftLeg.rotation.x = this.initialLegRotation.left;
        this.rightLeg.rotation.x = this.initialLegRotation.right;
    }

    /**
     * Walking animation: synchronized arm and leg swings
     * Speed parameter drives animation frequency
     */
    _updateWalkingAnimation(speed) {
        const frequency = WALK_ANIMATION_FREQUENCY + (speed * 0.5);
        const armAmplitude = ARM_SWING_AMPLITUDE;
        const legAmplitude = LEG_SWING_AMPLITUDE;

        // Sine wave for natural swing
        const swingPhase = Math.sin(this.animationTime * frequency);
        const swingPhaseOffset = Math.sin(this.animationTime * frequency + Math.PI);

        // Left arm forward, right leg forward (natural opposite swing)
        // Rotate on X axis for forward-backward motion
        this.leftArm.rotation.x = this.initialArmRotation.left + (swingPhase * armAmplitude);
        this.rightArm.rotation.x = this.initialArmRotation.right + (swingPhaseOffset * armAmplitude);

        // Left leg swings opposite to left arm
        this.leftLeg.rotation.x = swingPhaseOffset * legAmplitude;
        this.rightLeg.rotation.x = swingPhase * legAmplitude;
    }

    /**
     * Jumping animation: arms up during jump, then recovery
     */
    _updateJumpAnimation() {
        const timeSinceJump = this.animationTime - this.jumpStartTime;
        const pullUpProgress = Math.min(timeSinceJump / JUMP_PULL_UP_DURATION, 1);

        // Arms pull up briefly on jump
        const armPullUp = pullUpProgress < 0.5
            ? Math.sin(pullUpProgress * Math.PI * 2) * (Math.PI / 9)  // ±20°
            : 0;

        // Legs pull up during ascent
        const legPullUp = pullUpProgress < 0.5
            ? Math.sin(pullUpProgress * Math.PI * 2) * (Math.PI / 12)  // ±15°
            : 0;

        // Rotate on X axis for forward swing (consistent with walking)
        this.leftArm.rotation.x = this.initialArmRotation.left + armPullUp;
        this.rightArm.rotation.x = this.initialArmRotation.right + armPullUp;

        this.leftLeg.rotation.x = -legPullUp;
        this.rightLeg.rotation.x = -legPullUp;
    }
}
