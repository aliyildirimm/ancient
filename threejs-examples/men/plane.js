import * as THREE from "three";
import { GRID_DEPTH, GRID_WIDTH } from "./constants.js";

export const createPlane = () => {
    // make a 20x20 plane
    const overallplane = new THREE.Group();
    let arr = []
    for (let i = -8; i < 8; i++) {
        for (let j = -8; j < 8; j++) {
            const geo = new THREE.PlaneGeometry(GRID_WIDTH, GRID_DEPTH);
            const mat = new THREE.MeshLambertMaterial({
                color: Math.floor(Math.random() * 0xffffff),
                side: THREE.DoubleSide,
            });
            const plane = new THREE.Mesh(geo, mat);
            arr.push({
                plane,
                position: {
                    x: i*GRID_WIDTH,
                    y: j*GRID_DEPTH,
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
    overallplane.position.y = -1.5; // slightly below the cube
    return overallplane;
};