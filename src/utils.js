import * as THREE from "three";

export const createLight = () => {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    return light;
};


export const createCamera = (x,y,z) => {
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = z;
    camera.position.y = y;
    camera.position.x = x;
    return camera;
}
