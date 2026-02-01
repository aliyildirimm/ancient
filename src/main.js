import { createGameScene } from './game/index.js';

function init() {
    const canvas = document.querySelector("[data-canvas]");
    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("Canvas not found for selector: '[data-canvas]'");
    }

    // Create game scene
    const game = createGameScene(canvas);
    game.animate();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
