import * as THREE from "three";

const colors = [
    0xff0000, // red
    0x00ff00, // green
    0x0000ff, // blue
    0xffff00, // yellow
    0xff00ff, // magenta
    0x00ffff, // cyan
    0xff8800, // orange
    0x888888, // gray
    0x800080, // purple
    0x008000, // dark green
  ];

export const createLight = () => {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    return light;
};

export const createPlane = () => {
    // make a 20x20 plane
    const overallplane = new THREE.Group();
    let arr = []
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            const geo = new THREE.PlaneGeometry(2, 2);
            const mat = new THREE.MeshLambertMaterial({
                color: Math.floor(Math.random() * 0xffffff),
                side: THREE.DoubleSide,
            });
            const plane = new THREE.Mesh(geo, mat);
            console.log(i, j)
            arr.push({
                plane,
                position: {
                    x: i*2,
                    y: j*2,
                    z: 0
                }
            })
        }
    }

    arr.forEach((elem) => { 
        elem.plane.position.set(elem.position.x, elem.position.y, elem.position.z);
        overallplane.add(elem.plane); 
    })
    
    overallplane.rotation.x = -Math.PI / 2; // make it horizontal
    overallplane.position.y = -2.5; // slightly below the cube
    return overallplane;
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
