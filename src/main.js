/**
 * Main Entry Point
 * Initializes and starts the game
 */
import { createGameScene } from './game/index.js';

function init() {
    const canvas = document.querySelector("[data-canvas]");
    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("Canvas not found for selector: '[data-canvas]'");
    }

    // Create game scene
    const game = createGameScene(canvas);

    // Note: Keyboard controls are now handled by InputSystem
    // Camera switching is handled by InputSystem (keys 1, 2, 3)

    // Start game loop
    game.animate();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
