import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { petGroup, updatePet, checkTarget } from './pet.js';
import { state } from './state.js';

let scene, camera, renderer, composer, clock, raycaster, mouse;
let starField;

// Export cursor position for the pet to track
export let cursorPosition = new THREE.Vector2(0, 0);

export function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.025);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 1.5, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const container = document.getElementById('game-container');
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.4;     
    bloomPass.strength = 1.3;      
    bloomPass.radius = 0.8;        
    
    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    const hemiLight = new THREE.HemisphereLight(0x8b5cf6, 0x0f172a, 0.5);
    scene.add(hemiLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 8, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 3.0, 10);
    cyanLight.position.set(-3, 2, 2);
    scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xec4899, 3.0, 10);
    magentaLight.position.set(3, 2, 2);
    scene.add(magentaLight);

    const floorGeo = new THREE.CylinderGeometry(8, 8, 0.2, 64);
    const floorMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x1e1e2f, metalness: 0.8, roughness: 0.2, clearcoat: 1.0 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    scene.add(floor);

    createStars();
    scene.add(petGroup);

    clock = new THREE.Clock();
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('resize', onWindowResize, false);
    
    // Add pointer move listener for tracking
    container.addEventListener('pointermove', onPointerMove, false);
    container.addEventListener('pointerdown', onPointerDown, false);

    renderer.setAnimationLoop(animate);
}

function createStars() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const posArray = new Float32Array(starCount * 3);
    for(let i=0; i<starCount*3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMat = new THREE.PointsMaterial({
        size: 0.08, color: 0xc4b5fd, transparent: true, opacity: 0.8,
    });
    starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);
}

function onPointerMove(event) {
    cursorPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    cursorPosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    mouse.x = cursorPosition.x;
    mouse.y = cursorPosition.y;
}

function onPointerDown(event) {
    onPointerMove(event);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(petGroup.children, true);
    if (intersects.length > 0) {
        checkTarget();
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    const delta = clock.getDelta();
    state.update(delta);
    updatePet(delta, state);
    
    if(starField) {
        starField.rotation.y += delta * 0.02;
        starField.rotation.x += delta * 0.01;
    }

    composer.render(delta);
}
