import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import vertexShader from './shaders/blackhole.vert';
import fragmentShader from './shaders/blackhole.frag';
import { Controls } from './controls.js';

// ── Three.js Setup ──
const canvas = document.getElementById('blackhole-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,  // Not needed for full-screen shader
  alpha: false,
  powerPreference: 'high-performance'
});

// Use pixel ratio of 1.0 for performance — the shader is the bottleneck
// and rendering at native retina resolution quadruples the work
renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

// Camera — positioned high and close for dramatic view
// showing the dark shadow clearly surrounded by the accretion disk
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 14, 12);
camera.lookAt(0, 0, 0);

// Orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.minDistance = 4;
controls.maxDistance = 150;
controls.enablePan = false;
controls.rotateSpeed = 0.5;
controls.zoomSpeed = 0.8;
controls.target.set(0, 0, 0);

// ── Shader Material ──
const uniforms = {
  uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  uCameraPos: { value: camera.position.clone() },
  uCameraRotation: { value: new THREE.Matrix4() },
  uFOV: { value: camera.fov },
  uSpinParameter: { value: 0.75 },
  uSchwarzschildRadius: { value: 1.0 },
  uShowDisk: { value: true },
  uDiskInner: { value: 1.2 },
  uDiskOuter: { value: 15.0 },
  uDiskBrightness: { value: 2.0 },
  uDiskTemperature: { value: 6000.0 },
  uDopplerIntensity: { value: 1.0 },
  uMaxSteps: { value: 150 },
  uStarfield: { value: null },
  uTime: { value: 0.0 }
};

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
  depthWrite: false,
  depthTest: false
});

// Full-screen quad
const scene = new THREE.Scene();
const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Dummy camera for rendering the quad (ortho)
const renderCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// ── Post-Processing (Universe Sandbox Cinematic Bloom) ──
const renderPass = new RenderPass(scene, renderCamera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,   // intensity
  0.4,   // radius
  1.0    // threshold (only bloom bright objects > 1.0 HDR)
);
const outputPass = new OutputPass(); // applies ACESFilmicToneMapping

const composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(outputPass);

// ── UI Controls ──
const uiControls = new Controls(uniforms, camera, controls);

// Update resolution display
const renderW = Math.round(window.innerWidth * renderer.getPixelRatio());
const renderH = Math.round(window.innerHeight * renderer.getPixelRatio());
uiControls.updateResolution(renderW, renderH);

// ── Resize Handler ──
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  const rw = Math.round(w * renderer.getPixelRatio());
  const rh = Math.round(h * renderer.getPixelRatio());
  uniforms.uResolution.value.set(rw, rh);
  uiControls.updateResolution(rw, rh);
});

// ── FPS Counter ──
let frameCount = 0;
let lastFPSTime = performance.now();
let currentFPS = 60;

function updateFPS() {
  frameCount++;
  const now = performance.now();
  if (now - lastFPSTime >= 500) {
    currentFPS = frameCount / ((now - lastFPSTime) / 1000);
    uiControls.updateFPS(currentFPS);
    frameCount = 0;
    lastFPSTime = now;
  }
}

// ── Animation Loop ──
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  // Update camera uniforms
  uniforms.uCameraPos.value.copy(camera.position);
  uniforms.uFOV.value = camera.fov;

  // Build rotation matrix from camera
  const rotMatrix = new THREE.Matrix4();
  rotMatrix.makeRotationFromQuaternion(camera.quaternion);
  uniforms.uCameraRotation.value.copy(rotMatrix);

  // Time
  uniforms.uTime.value = clock.getElapsedTime();

  composer.render();

  updateFPS();
}

animate();

// ── Fade in UI ──
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
});
setTimeout(() => document.body.classList.add('loaded'), 100);
