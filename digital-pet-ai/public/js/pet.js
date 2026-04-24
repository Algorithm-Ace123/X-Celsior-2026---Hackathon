import * as THREE from 'three';
import { state } from './state.js';
import { cursorPosition } from './scene.js';
import { stopDanceMusic } from './music.js';

export const petGroup = new THREE.Group();

const bodyGeo = new THREE.CapsuleGeometry(0.8, 0.6, 8, 32);
const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.3, clearcoat: 1.0 });
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.position.y = 1.4;
body.castShadow = true;
petGroup.add(body);

const ringGeo = new THREE.TorusGeometry(1.2, 0.05, 16, 64);
const ringMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 1.0 });
const energyRing = new THREE.Mesh(ringGeo, ringMat);
energyRing.rotation.x = Math.PI / 2 + 0.2;
body.add(energyRing);

const domeGeo = new THREE.SphereGeometry(0.7, 32, 32);
const domeMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transmission: 0.9, opacity: 1, metalness: 0, roughness: 0, ior: 1.5, thickness: 0.1, transparent: true
});
const helmet = new THREE.Mesh(domeGeo, domeMat);
helmet.position.set(0, 1.0, 0); 
body.add(helmet);

const faceGeo = new THREE.SphereGeometry(0.4, 32, 32);
const faceMat = new THREE.MeshStandardMaterial({ color: 0x050510, roughness: 0.2 });
const facePlate = new THREE.Mesh(faceGeo, faceMat);
facePlate.position.set(0, 1.0, 0); 
body.add(facePlate);

const eyeGeo = new THREE.CapsuleGeometry(0.08, 0.1, 4, 16);
const eyeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 2.0 });
const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
leftEye.position.set(-0.15, 0.05, 0.35); 
leftEye.rotation.z = -0.1;
const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
rightEye.position.set(0.15, 0.05, 0.35);
rightEye.rotation.z = 0.1;
facePlate.add(leftEye, rightEye);

const cheekGeo = new THREE.CircleGeometry(0.06, 16);
const cheekMat = new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xec4899, emissiveIntensity: 1.5 });
const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
leftCheek.position.set(-0.25, -0.05, 0.36);
leftCheek.rotation.y = -0.4;
const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
rightCheek.position.set(0.25, -0.05, 0.36);
rightCheek.rotation.y = 0.4;
facePlate.add(leftCheek, rightCheek);

const limbGeo = new THREE.CapsuleGeometry(0.2, 0.3, 4, 16);
const leftHand = new THREE.Mesh(limbGeo, bodyMat);
leftHand.castShadow = true;
const rightHand = new THREE.Mesh(limbGeo, bodyMat);
rightHand.castShadow = true;
petGroup.add(leftHand, rightHand);

const leftFoot = new THREE.Mesh(limbGeo, bodyMat);
const rightFoot = new THREE.Mesh(limbGeo, bodyMat);
petGroup.add(leftFoot, rightFoot);

const flameGeo = new THREE.ConeGeometry(0.15, 0.4, 16);
const flameMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 2, transparent: true, opacity: 0.8 });
const leftFlame = new THREE.Mesh(flameGeo, flameMat);
leftFlame.position.y = -0.3;
leftFlame.rotation.x = Math.PI;
leftFoot.add(leftFlame);
const rightFlame = leftFlame.clone();
rightFoot.add(rightFlame);

const auraGeo = new THREE.BufferGeometry();
const auraPoints = 100;
const aArr = new Float32Array(auraPoints * 3);
for(let i=0; i<auraPoints*3; i++) {
    aArr[i] = (Math.random() - 0.5) * 4.5;
}
auraGeo.setAttribute('position', new THREE.BufferAttribute(aArr, 3));
const auraMat = new THREE.PointsMaterial({ size: 0.05, color: 0xec4899, transparent: true, opacity: 0.5 });
const aura = new THREE.Points(auraGeo, auraMat);
body.add(aura);

const shadowGeo = new THREE.PlaneGeometry(3, 3);
const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false });
const blobShadow = new THREE.Mesh(shadowGeo, shadowMat);
blobShadow.rotation.x = -Math.PI / 2;
blobShadow.position.y = 0.02;
petGroup.add(blobShadow);

let timeValue = 0;
let actionState = 'idle'; 
let actionTimer = 0;
let targetScale = new THREE.Vector3(1,1,1);
export let isFollowingCursor = false;

export function toggleFollowCursor() {
    isFollowingCursor = !isFollowingCursor;
    return isFollowingCursor;
}

export function updatePet(delta, petState) {
    timeValue += delta;
    if(actionTimer > 0) {
        actionTimer -= delta;
        if(actionTimer <= 0) {
            if(actionState === 'dancing') stopDanceMusic();
            actionState = 'idle';
            leftEye.scale.y = 1; rightEye.scale.y = 1;
            leftFlame.scale.y = 1; rightFlame.scale.y = 1;
        }
    }
    
    let speed = 1;
    if (petState.energy < 30) speed = 0.5;
    if (actionState === 'dancing') speed = 3;
    const t = timeValue * speed;

    energyRing.rotation.z += delta * 2.0;
    aura.rotation.y -= delta * 0.5;

    let targetC = new THREE.Color(0x06b6d4); 
    if (petState.hunger < 30) targetC.setHex(0xf59e0b); 
    if (petState.energy < 20) targetC.setHex(0x8b5cf6); 
    if (petState.mood < 30) targetC.setHex(0xef4444); 
    
    eyeMat.color.lerp(targetC, 0.05);
    eyeMat.emissive.lerp(targetC, 0.05);
    flameMat.color.lerp(targetC, 0.05);
    flameMat.emissive.lerp(targetC, 0.05);
    ringMat.color.lerp(targetC, 0.05);
    ringMat.emissive.lerp(targetC, 0.05);

    body.scale.lerp(targetScale, 0.1);

    if (isFollowingCursor) {
        const targetX = cursorPosition.x * 6.0; 
        const targetY = cursorPosition.y * 3.0;
        
        petGroup.position.x += (targetX - petGroup.position.x) * 0.08;
        petGroup.position.y += (targetY - petGroup.position.y) * 0.08;
        
        body.rotation.z += ((petGroup.position.x - targetX) * 0.3 - body.rotation.z) * 0.1;
        
        const velocity = Math.abs(targetX - petGroup.position.x) + Math.abs(targetY - petGroup.position.y);
        leftFlame.scale.y = 1.0 + velocity * 2.0; 
        rightFlame.scale.y = 1.0 + velocity * 2.0;
    } else {
        petGroup.position.x += (0 - petGroup.position.x) * 0.04;
        petGroup.position.y += (0 - petGroup.position.y) * 0.04;
        body.rotation.z += (0 - body.rotation.z) * 0.1;
    }

    if (actionState === 'dancing') {
        const jump = Math.abs(Math.sin(t * 3)) * 1.5;
        body.position.y = 1.4 + jump;
        body.rotation.y += delta * 10; 
        body.rotation.z = Math.sin(t * 5) * 0.3; 
        facePlate.rotation.y = Math.sin(t*2)*0.5; 
        
        leftHand.position.set(-1.4, 2.5 + Math.sin(t*8)*0.5, 0);
        rightHand.position.set(1.4, 2.5 + Math.cos(t*8)*0.5, 0);
        
        leftFoot.position.set(-0.6, 0.5 + (Math.sin(t*6) > 0 ? 0.6 : 0), 0);
        rightFoot.position.set(0.6, 0.5 + (Math.cos(t*6) > 0 ? 0.6 : 0), 0);
        
        leftFlame.scale.y = 3.0; rightFlame.scale.y = 3.0;
        targetScale.set(0.9, 1.2, 0.9);

    } else if (actionState === 'playing') {
        const jump = Math.abs(Math.sin(t * 4)) * 0.8;
        body.position.y = 1.4 + jump;
        body.rotation.y = Math.sin(t * 2) * 1.0; 
        facePlate.rotation.y = Math.sin(t*3)*0.5;
        
        leftHand.position.set(-1.2, 2.0 + Math.sin(t*5)*0.5, 0.5);
        rightHand.position.set(1.2, 2.0 + Math.cos(t*5)*0.5, 0.5);
        
        leftFoot.position.set(-0.6, 0.8, 0.5 + Math.sin(t*5)*0.5);
        rightFoot.position.set(0.6, 0.8, 0.5 - Math.sin(t*5)*0.5); 
        if(!isFollowingCursor) { leftFlame.scale.y = 2.0; rightFlame.scale.y = 2.0; }
        
        targetScale.set(1.15, 0.85, 1.15);

    } else if (actionState === 'feeding') {
        body.position.y = 1.4 + Math.sin(t*2)*0.1;
        body.rotation.y = 0; 
        facePlate.rotation.y = 0;
        
        leftHand.position.set(-0.4, 2.0, 1.1);
        rightHand.position.set(0.4, 2.0, 1.1); 
        
        leftFoot.position.set(-0.6, 0.4, 0.2);
        rightFoot.position.set(0.6, 0.4, 0.2);
        
        targetScale.set(1.2, 0.8, 1.2); 
        
    } else if (actionState === 'sleeping') {
        body.position.y = 0.6; 
        body.rotation.y = 0;
        facePlate.rotation.y = 0;
        
        leftHand.position.set(-1.0, 0.3, 0);
        rightHand.position.set(1.0, 0.3, 0);
        leftFoot.position.set(-0.5, 0.2, -0.8);
        leftFoot.rotation.x = -Math.PI/2;
        rightFoot.position.set(0.5, 0.2, -0.8);
        rightFoot.rotation.x = -Math.PI/2;
        
        leftFlame.scale.y = 0.01; rightFlame.scale.y = 0.01;
        
        targetScale.set(1.1, 0.8, 1.1);
        leftEye.scale.y = 0.1; rightEye.scale.y = 0.1; 

    } else {
        body.rotation.z = 0;
        const bounce = Math.sin(t * 2) * 0.15;
        body.position.y = 1.4 + bounce;
        
        body.rotation.y += (Math.sin(t * 0.5) * 0.2 - body.rotation.y) * 0.1;
        facePlate.rotation.y = Math.sin(t * 0.8) * 0.1; 
        
        leftHand.position.set(-1.2, 1.2 + bounce*1.5, 0.2);
        rightHand.position.set(1.2, 1.2 + bounce*1.5, 0.2);
        
        leftFoot.position.set(-0.5, 0.5 + bounce, 0.1 + Math.sin(t)*0.1);
        leftFoot.rotation.x = 0; rightFoot.rotation.x = 0;
        rightFoot.position.set(0.5, 0.5 + bounce, 0.1 + Math.cos(t)*0.1);
        
        if(!isFollowingCursor) {
            leftFlame.scale.y = 1.0 + Math.sin(t*10)*0.2;
            rightFlame.scale.y = 1.0 + Math.sin(t*10)*0.2;
        }
        
        targetScale.set(1.0, 1.0, 1.0);
        
        if (Math.random() > 0.99) {
            leftEye.scale.y = 0.1; rightEye.scale.y = 0.1;
        } else {
            leftEye.scale.y += (1.0 - leftEye.scale.y) * 0.3;
            rightEye.scale.y += (1.0 - rightEye.scale.y) * 0.3;
        }
    }

    blobShadow.position.x = petGroup.position.x;
    blobShadow.position.z = petGroup.position.y * 0.1; 
    blobShadow.scale.setScalar(1 + (Math.max(0, (body.position.y + petGroup.position.y) - 1.4)*0.2));
    blobShadow.material.opacity = 0.3 / (Math.max(0.1, (body.position.y + petGroup.position.y) / 1.4));
}

export function triggerActionAnimation(type) {
    actionState = type;
    if(type === 'dancing') actionTimer = 4.0;
    else if(type === 'playing') actionTimer = 2.5;
    else if(type === 'sleeping') actionTimer = 5.0; 
    else actionTimer = 1.5;
}

export function checkTarget() {
    state.affection = Math.min(100, state.affection + 15);
    state.mood = Math.min(100, state.mood + 10);
    
    if(Math.random() > 0.5) {
        triggerActionAnimation('dancing');
        if(typeof stopDanceMusic !== 'undefined') window.playDanceMusic?.();
    } else {
        triggerActionAnimation('playing');
    }
    
    const bubble = document.getElementById('pet-speech-bubble');
    if(bubble) {
        bubble.innerText = "Beep Boop! ✨🚀";
        bubble.classList.remove('hidden');
        clearTimeout(bubble.timeoutId);
        bubble.timeoutId = setTimeout(() => { bubble.classList.add('hidden'); }, 6000);
    }
}
