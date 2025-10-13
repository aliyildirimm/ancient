import * as THREE from "three";

export const createLight = () => {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    return light;
};

export const createPlane = () => {
    // make a 20x20 plane
    const geo = new THREE.PlaneGeometry(20, 20);
    const mat = new THREE.MeshLambertMaterial({
      color: 0x808080,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geo, mat);
    plane.rotation.x = -Math.PI / 2; // make it horizontal
    plane.position.y = -2.5; // slightly below the cube
    return plane;
};


export const createCamera = (x,y,z) => {
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = z;
    camera.position.x = x;
    return camera;
}