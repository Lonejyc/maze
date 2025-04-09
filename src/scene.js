import { Scene, Color, PerspectiveCamera, WebGLRenderer, ACESFilmicToneMapping, 
    sRGBEncoding, PointLight, PCFSoftShadowMap } from 'https://cdn.skypack.dev/three@0.137';
import { OrbitControls } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/controls/OrbitControls';

// Setup the scene
export function setupScene() {
const scene = new Scene();
scene.background = new Color("#FFEECC");
return scene;
}

// Setup the camera
export function setupCamera() {
const camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(-27, 41, 33);
return camera;
}

// Setup the renderer
export function setupRenderer() {
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.outputEncoding = sRGBEncoding;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
return renderer;
}

// Setup lighting
export function setupLights(scene) {
const light = new PointLight(new Color("#FFCB8E").convertSRGBToLinear().convertSRGBToLinear(), 80, 200);
light.position.set(10, 20, 10);
light.castShadow = true;
light.shadow.mapSize.width = 512;
light.shadow.mapSize.height = 512;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 500;
scene.add(light);
return light;
}

// Setup orbit controls
export function setupControls(camera, renderer) {
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.dampingFactor = 0.05;
controls.enableDamping = true;
return controls;
}