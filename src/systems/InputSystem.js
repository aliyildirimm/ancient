/**
 * InputSystem
 * Centralizes all input handling (keyboard, mouse)
 *
 * Features:
 * - Tracks key pressed/released state
 * - Detects "just pressed" and "just released" events
 * - Mouse position and button tracking
 * - Action mapping for future gamepad/rebinding support
 * - Clean lifecycle management
 */
export class InputSystem {
    constructor() {
        // Key state tracking
        this.keys = new Map();              // Current pressed state
        this.keysJustPressed = new Set();   // Pressed this frame (cleared each update)
        this.keysJustReleased = new Set();  // Released this frame (cleared each update)

        // Mouse state tracking
        this.mousePosition = { x: 0, y: 0 };
        this.mouseButtons = new Map();

        // Action mapping for extensibility (gamepad, rebinding)
        this.actionMap = new Map();

        // Bind event handlers to maintain 'this' context
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    /**
     * Initialize the input system
     * Registers DOM event listeners
     */
    init() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    /**
     * Pre-update phase - clear frame-specific input states
     */
    preUpdate(deltaTime, entities) {
        // Clear "just pressed/released" states each frame
        this.keysJustPressed.clear();
        this.keysJustReleased.clear();
    }

    /**
     * Cleanup - remove all event listeners
     * Call this when destroying the game scene
     */
    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mouseup', this.handleMouseUp);

        this.keys.clear();
        this.keysJustPressed.clear();
        this.keysJustReleased.clear();
        this.mouseButtons.clear();
        this.actionMap.clear();
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

    /**
     * Check if a key was just released this frame
     * @param {string} key - Key to check (lowercase)
     * @returns {boolean}
     */
    wasKeyJustReleased(key) {
        return this.keysJustReleased.has(key.toLowerCase());
    }

    /**
     * Get current mouse position
     * @returns {{x: number, y: number}}
     */
    getMousePosition() {
        return { ...this.mousePosition };
    }

    /**
     * Check if a mouse button is pressed
     * @param {number} button - Button index (0=left, 1=middle, 2=right)
     * @returns {boolean}
     */
    isMouseButtonPressed(button) {
        return this.mouseButtons.get(button) || false;
    }

    // ==================== Action Mapping ====================

    /**
     * Map an action name to one or more keys
     * Useful for gamepad support and key rebinding
     *
     * @param {string} actionName - Name of the action
     * @param {...string} keys - Keys that trigger this action
     *
     * @example
     * inputSystem.mapAction('jump', ' ', 'w');
     * inputSystem.mapAction('moveForward', 'w', 'arrowup');
     */
    mapAction(actionName, ...keys) {
        this.actionMap.set(actionName, keys.map(k => k.toLowerCase()));
    }

    /**
     * Check if an action is currently active
     * @param {string} actionName - Name of the action
     * @returns {boolean}
     */
    isActionPressed(actionName) {
        const keys = this.actionMap.get(actionName);
        if (!keys) return false;
        return keys.some(key => this.isKeyPressed(key));
    }

    /**
     * Check if an action was just activated this frame
     * @param {string} actionName - Name of the action
     * @returns {boolean}
     */
    wasActionJustPressed(actionName) {
        const keys = this.actionMap.get(actionName);
        if (!keys) return false;
        return keys.some(key => this.wasKeyJustPressed(key));
    }

    /**
     * Check if an action was just deactivated this frame
     * @param {string} actionName - Name of the action
     * @returns {boolean}
     */
    wasActionJustReleased(actionName) {
        const keys = this.actionMap.get(actionName);
        if (!keys) return false;
        return keys.some(key => this.wasKeyJustReleased(key));
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
        this.keysJustReleased.add(key);
    }

    /**
     * Handle mousemove events
     * @private
     */
    handleMouseMove(event) {
        this.mousePosition.x = event.clientX;
        this.mousePosition.y = event.clientY;
    }

    /**
     * Handle mousedown events
     * @private
     */
    handleMouseDown(event) {
        this.mouseButtons.set(event.button, true);
    }

    /**
     * Handle mouseup events
     * @private
     */
    handleMouseUp(event) {
        this.mouseButtons.set(event.button, false);
    }
}
