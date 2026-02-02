/**
 * Animation Controller Component
 * Manages playing model-based animations using THREE.AnimationMixer
 * Tracks animation state (idle/walk/jump) and transitions smoothly between them
 */
import * as THREE from "three";

export class AnimationController {
    constructor(model, animations = []) {
        this.model = model;
        this.animations = animations;
        this.mixer = null;
        this.currentAction = null;
        this.currentState = 'idle'; // 'idle', 'walking', 'jumping'
        this.actions = {};

        // Initialize mixer if model exists
        if (this.model && this.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.model);
            this._initializeActions();
        }
    }

    /**
     * Initialize animation actions from loaded animations
     * Maps animation clip names to action references for easy playback
     */
    _initializeActions() {
        if (!this.mixer) return;

        // Create actions for common animation names
        // Adjust these names based on your humanoid.glb's actual animation names
        const animationNames = {
            idle: ['Idle', 'idle', 'Armature|Idle', 'mixamo.com|Idle'],
            walk: ['Walk', 'walk', 'Walking', 'walking', 'Armature|Walk', 'mixamo.com|Walk'],
            jump: ['Jump', 'jump', 'Jumping', 'jumping', 'Armature|Jump', 'mixamo.com|Jump']
        };

        // Try to find and create actions for each state
        for (const [state, names] of Object.entries(animationNames)) {
            for (const clipName of names) {
                const clip = THREE.AnimationClip.findByName(this.animations, clipName);
                if (clip) {
                    const action = this.mixer.clipAction(clip);
                    action.clampWhenFinished = true;
                    this.actions[state] = action;
                    break;
                }
            }
        }

        // If no animations found, create a fallback idle state (no animation)
        if (Object.values(this.actions).filter(a => a !== null).length === 0) {
            this.actions.idle = null;
            this.actions.walk = null;
            this.actions.jump = null;
        }
    }

    /**
     * Update the animation state based on entity input and physics
     */
    update(deltaTime, entity) {
        if (!this.mixer) {
            return;
        }

        // Determine what state we should be in
        const movement = entity.getComponent('movement');
        const physics = entity.getComponent('physics');

        const isMoving = movement &&
            (movement.inputSystem?.isKeyPressed('w') ||
             movement.inputSystem?.isKeyPressed('s'));

        const isJumping = physics && !physics.isGrounded;

        // Determine new state (must match keys from animationNames in _initializeActions)
        let newState = 'idle';
        if (isJumping) {
            newState = 'jump';  // matches 'jump' key in animationNames
        } else if (isMoving) {
            newState = 'walk';   // matches 'walk' key in animationNames
        }

        // Transition to new state if different
        if (newState !== this.currentState) {
            this._transitionToState(newState);
            this.currentState = newState;
        }

        // Update the mixer (advances animations)
        this.mixer.update(deltaTime);
    }

    /**
     * Transition smoothly from current animation to next
     */
    _transitionToState(newState) {
        const oldAction = this.currentAction;
        const newAction = this.actions[newState];

        // Stop old animation
        if (oldAction) {
            oldAction.stop();
        }

        // Start new animation
        if (newAction) {
            newAction.reset();
            newAction.play();
            this.currentAction = newAction;
        } else {
            this.currentAction = null;
        }
    }

    /**
     * Cleanup - stop mixer and animations
     */
    onRemove(entity) {
        if (this.mixer) {
            this.mixer.stopAllAction();
        }
    }
}
