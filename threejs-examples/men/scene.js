import * as THREE from "https://threejs.org/build/three.module.js";

const createHuman = () => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    return new THREE.Mesh(geo, mat);
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
    plane.position.y = -0.5; // slightly below the cube
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
          console.log("here")
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
