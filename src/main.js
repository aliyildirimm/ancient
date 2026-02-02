import { createGameScene } from './game/index.js';

async function init() {
    const canvas = document.querySelector("[data-canvas]");
    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("Canvas not found for selector: '[data-canvas]'");
    }

    // TODO: Set the model URL here
    const modelUrl = '../models/humanoid.glb';

    // Create game scene
    const game = await createGameScene(canvas, modelUrl);
    game.animate();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
