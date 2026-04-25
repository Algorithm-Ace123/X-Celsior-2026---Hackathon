import { initScene } from './js/scene.js';
import { initControls } from './js/controls.js';
import { initChat } from './js/chat.js';
import { initVoice } from './js/voice.js';
import { initAudioReactivity } from './js/music.js';
import { triggerActionAnimation } from './js/pet.js';

console.log('Digital Pet AI Architecture Initialized.');

// Initialize subsystems
initScene();
initControls();

// Tie voice to chat wrapper
const chat = initChat();
initVoice((spokenText) => {
    chat.sendMessage(spokenText);
});

// Setup audio reactivity
initAudioReactivity((loudness) => {
    console.log("Audio reacted!", loudness);
    triggerActionAnimation('dancing');
    const bubble = document.getElementById('pet-speech-bubble');
    if(bubble) {
        bubble.innerText = "I hear that! 🎵";
        bubble.classList.remove('hidden');
        clearTimeout(bubble.timeoutId);
        bubble.timeoutId = setTimeout(() => bubble.classList.add('hidden'), 3000);
    }
});
