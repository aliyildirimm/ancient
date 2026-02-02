import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let cachedGltf = null;
const loader = new GLTFLoader();

// Keep texture blob objects alive in memory to prevent GC
let textureBlobs = [];

/**
 * Load a humanoid model with animations
 * Returns both the scene and animations for AnimationMixer
 * Preserves blob URL texture data by keeping references alive
 */
export const loadHumanoidModelWithAnimations = (modelUrl) => {
    return new Promise((resolve, reject) => {
        loader.load(
            modelUrl,
            (gltf) => {
                // Cache the original GLTF to keep all data alive
                if (!cachedGltf) {
                    cachedGltf = gltf;

                    // Keep texture blob data alive by extracting blob URLs
                    // This prevents garbage collection of the underlying blob objects
                    gltf.scene.traverse((node) => {
                        if (node.isMesh && node.material) {
                            const materials = Array.isArray(node.material) ? node.material : [node.material];
                            materials.forEach((mat) => {
                                if (mat.map && mat.map.source && mat.map.source.data) {
                                    // Store reference to prevent GC
                                    textureBlobs.push(mat.map.source.data);
                                }
                            });
                        }
                    });
                }

                // Don't clone - just return the cached scene directly
                // This ensures all materials and textures reference the valid loaded objects
                resolve({
                    scene: gltf.scene,
                    animations: gltf.animations || []
                });
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error);
                reject(error);
            }
        );
    });
};

/**
 * Load a humanoid model from a URL
 * Returns the scene while keeping all texture data alive
 */
export const loadHumanoidModel = (modelUrl) => {
    return loadHumanoidModelWithAnimations(modelUrl).then(result => result.scene);
};

/**
 * Extract bone references from a loaded model
 * Returns a map of common bone names
 */
export const extractBoneMap = (model) => {
    const boneMap = {};

    // Traverse the model to find bones
    model.traverse((node) => {
        if (node.isBone || node instanceof THREE.Bone) {
            boneMap[node.name] = node;
        }
    });

    return boneMap;
};

/**
 * Find bones by partial name matching
 * Useful when bone names differ between models
 */
export const findBonesByPattern = (model, patterns) => {
    const result = {};
    const boneMap = extractBoneMap(model);

    for (const [key, pattern] of Object.entries(patterns)) {
        for (const [boneName, bone] of Object.entries(boneMap)) {
            if (boneName.toLowerCase().includes(pattern.toLowerCase())) {
                result[key] = bone;
                break;
            }
        }
    }

    return result;
};
