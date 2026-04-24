import { initScene } from './js/scene.js';
import { initControls } from './js/controls.js';
import { initChat } from './js/chat.js';
import { initVoice } from './js/voice.js';

console.log('Digital Pet AI Architecture Initialized.');

// Initialize subsystems
initScene();
initControls();

// Tie voice to chat wrapper
const chat = initChat();
initVoice((spokenText) => {
    chat.sendMessage(spokenText);
});
