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

    // Setup keyboard controls
    window.addEventListener("keydown", game.handleKeyboardEvents);
    window.addEventListener("keyup", game.handleKeyboardEvents);
    window.addEventListener("keyup", (event) => {
        if (event.code === "Space") {
            game.jump();
        }
    });

    // Setup camera buttons
    document.querySelectorAll("[data-cam]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const camIndex = btn.getAttribute("data-cam");
            game.handleCameraChangeEvent(camIndex);
        });
    });

    // Start game loop
    game.animate();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
