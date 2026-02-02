/**
 * InputSystem
 * Centralizes keyboard input handling
 *
 * Features:
 * - Tracks key pressed state
 * - Detects "just pressed" events
 * - Clean lifecycle management
 */
export class InputSystem {
    constructor() {
        // Key state tracking
        this.keys = new Map();              // Current pressed state
        this.keysJustPressed = new Set();   // Pressed this frame (cleared each update)

        // Bind event handlers to maintain 'this' context
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    /**
     * Initialize the input system
     * Registers DOM event listeners
     */
    init() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    /**
     * Pre-update phase - clear frame-specific input states
     */
    preUpdate(deltaTime, entities) {
        // Clear "just pressed" state each frame
        this.keysJustPressed.clear();
    }

    /**
     * Cleanup - remove all event listeners
     * Call this when destroying the game scene
     */
    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);

        this.keys.clear();
        this.keysJustPressed.clear();
    }

    // ==================== Query API ====================

    /**
     * Check if a key is currently pressed
     * @param {string} key - Key to check (lowercase)
     * @returns {boolean}
     */
    isKeyPressed(key) {
        return this.keys.get(key.toLowerCase()) || false;
    }

    /**
     * Check if a key was just pressed this frame
     * @param {string} key - Key to check (lowercase)
     * @returns {boolean}
     */
    wasKeyJustPressed(key) {
        return this.keysJustPressed.has(key.toLowerCase());
    }

    // ==================== Event Handlers ====================

    /**
     * Handle keydown events
     * @private
     */
    handleKeyDown(event) {
        const key = event.key.toLowerCase();

        // Only mark as "just pressed" if it wasn't already pressed
        if (!this.keys.get(key)) {
            this.keysJustPressed.add(key);
        }

        this.keys.set(key, true);
    }

    /**
     * Handle keyup events
     * @private
     */
    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        this.keys.set(key, false);
    }
}
