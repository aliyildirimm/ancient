import * as THREE from "three";
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  GRID_DEPTH,
  BUILDING_WIDTH,
  BUILDING_DEPTH,
  BUILDING_HEIGHTS
} from "../config/constants.js";

export const createPlane = () => {
  const overallPlane = new THREE.Group();

  const groundGeometry = new THREE.BoxGeometry(GRID_WIDTH, GRID_HEIGHT, GRID_DEPTH);
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x00aa00, side: THREE.DoubleSide });

  const buildingGeometries = [
    new THREE.BoxGeometry(BUILDING_WIDTH, BUILDING_HEIGHTS[0], BUILDING_DEPTH),
    new THREE.BoxGeometry(BUILDING_WIDTH, BUILDING_HEIGHTS[1], BUILDING_DEPTH),
    new THREE.BoxGeometry(BUILDING_WIDTH, BUILDING_HEIGHTS[2], BUILDING_DEPTH),
  ];

  for (let i = -16; i < 1; i++) {
    for (let j = -16; j < 1; j++) {
      const plane = new THREE.Mesh(groundGeometry, groundMaterial);
      plane.position.set(i * GRID_WIDTH, 0, j * GRID_DEPTH);
      plane.receiveShadow = true;
      overallPlane.add(plane);

      if (Math.random() < 0.25 && i !== 0 && j !== 0) {
        const idx = Math.floor(Math.random() * 3);
        const geom = buildingGeometries[idx];

        const mat = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
        mat.color.setHex(Math.floor(Math.random() * 0x1000000));

        const buildingMesh = new THREE.Mesh(geom, mat);

        const gridMargin = GRID_HEIGHT / 2;
        const buildingCenterY = gridMargin + (BUILDING_HEIGHTS[idx] / 2);
        buildingMesh.position.set(i * GRID_WIDTH, buildingCenterY, j * GRID_DEPTH);

        overallPlane.add(buildingMesh);
      }
    }
  }

  return overallPlane;
};
