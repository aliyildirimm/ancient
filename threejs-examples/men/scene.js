import * as THREE from "https://threejs.org/build/three.module.js";

const createHuman = () => {
    const human = new THREE.Group();
  
    // --- ölçüler ---
    const bodyH = 1.2;
    const bodyW = 1.0;
    const bodyD = 0.5;
  
    const legH = 1.0;
    const legW = 0.4;
    const legD = 0.1;
  
    const headH = 0.4;
    const headW = 0.4;
    const headD = 0.4;
  
    const armH = 0.8;
    const armW = 0.25;
    const armD = 0.1;
  
    const hipGap = 0.2;
    const neckGap = 0.1;
    const armAngle = THREE.MathUtils.degToRad(30); // 30 derece
  
    // --- konum hesapları ---
    const legsY = -legH / 2;
    const bodyY = hipGap + bodyH / 2;
    const headY = bodyY + bodyH / 2 + neckGap + headH / 2;
    const armsY = bodyY + 0.1; // gövde ortasına yakın
  
    // --- gövde ---
    const bodyGeo = new THREE.BoxGeometry(bodyW, bodyH, bodyD);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, bodyY, 0);
    human.add(body);
  
    // --- kafa ---
    const headGeo = new THREE.BoxGeometry(headW, headH, headD);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, headY, 0);
    human.add(head);
  
    // --- bacaklar ---
    const legGeo = new THREE.BoxGeometry(legW, legH, legD);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x3333ff });
  
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.25, legsY, 0);
    human.add(leftLeg);
  
    const rightLeg = new THREE.Mesh(legGeo, legMat.clone());
    rightLeg.position.set(0.25, legsY, 0);
    human.add(rightLeg);
  
    // --- kollar ---
    const armGeo = new THREE.BoxGeometry(armW, armH, armD);
    const armMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-bodyW / 2 - armW / 2, armsY, 0);
    leftArm.rotation.z = -armAngle; // 30 derece yukarı
    human.add(leftArm);
  
    const rightArm = new THREE.Mesh(armGeo, armMat.clone());
    rightArm.position.set(bodyW / 2 + armW / 2, armsY, 0);
    rightArm.rotation.z = armAngle; // 30 derece yukarı ters yönde
    human.add(rightArm);
  
    return human;
  };
  

const createLight = () => {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    return light;
};

const createPlane = () => {
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


const createCamera = (x,y,z) => {
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


const attachEventHandlers = () => {
    // events
    window.addEventListener("keydown", (e) => {
        const k = e.key.toLowerCase();
        if (k in keys) keys[k] = true;
    });
    window.addEventListener("keyup", (e) => {
        const k = e.key.toLowerCase();
        if (k in keys) keys[k] = false;
    });
}


const keys = { w: false, a: false, s: false, d: false };
const speed = 2;

export function main() {
    const canvas = document.querySelector("[data-canvas]");
    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("Canvas not found for selector: '[data-canvas]'");
    }
    attachEventHandlers();

    // scene
    const scene = new THREE.Scene();

    // three cameras
    const camera1 = createCamera(-2, 0, 5);
    const camera2 = createCamera(0, 0, 5);
    const camera3 = createCamera(2, 0, 5);
    scene.add(camera1, camera2, camera3);
    let currentCamera = camera2;

    // human + light
    const human = createHuman();
    scene.add(human);

    const light = createLight();
    scene.add(light);

    // add the plane
    const plane = createPlane();
    scene.add(plane);

    // renderer
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.querySelectorAll("[data-cam]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const camIndex = btn.getAttribute("data-cam");
          if (camIndex === "1") currentCamera = camera1;
          if (camIndex === "2") currentCamera = camera2;
          if (camIndex === "3") currentCamera = camera3;
        });
    });

    // loop
    let prevTime = performance.now();
    function loop(now) {
        const dt = (now - prevTime) / 1000;
        prevTime = now;

        if (keys.w) human.position.z -= speed * dt;
        if (keys.s) human.position.z += speed * dt;
        if (keys.a) human.position.x -= speed * dt;
        if (keys.d) human.position.x += speed * dt;

        renderer.render(scene, currentCamera);
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}
