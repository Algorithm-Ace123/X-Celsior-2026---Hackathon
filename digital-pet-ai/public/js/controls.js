import { state } from './state.js';
import { triggerActionAnimation, toggleFollowCursor } from './pet.js';
import { playDanceMusic } from './music.js';

export function initControls() {
    const bindBtn = (id, action) => {
        const btn = document.getElementById(id);
        if(!btn) return;
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            action();
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => btn.style.transform = '', 150);
        });
    };

    bindBtn('btn-feed', () => {
        state.hunger = Math.min(100, state.hunger + 40);
        state.affection = Math.min(100, state.affection + 10);
        state.mood = Math.min(100, state.mood + 15);
        triggerActionAnimation('feeding');
        showFloatingText("Energy refilled! 🔋");
    });
    
    bindBtn('btn-play', () => {
        if (state.energy < 20) {
            showFloatingText("System low power... 💤");
            return;
        }
        state.mood = Math.min(100, state.mood + 30);
        state.energy = Math.max(0, state.energy - 25);
        triggerActionAnimation('playing');
        showFloatingText("Orbiting! 🪐");
    });

    bindBtn('btn-dance', () => {
        if (state.energy < 30) {
            showFloatingText("Need recharge! ⚡");
            return;
        }
        state.mood = Math.min(100, state.mood + 40);
        state.energy = Math.max(0, state.energy - 35);
        
        triggerActionAnimation('dancing');
        playDanceMusic();
        showFloatingText("Hyperdrive active! 🚀");
    });

    bindBtn('btn-pet', () => {
        state.affection = Math.min(100, state.affection + 25);
        state.mood = Math.min(100, state.mood + 20);
        triggerActionAnimation('playing');
        showFloatingText("Sensors happy! ✨");
    });

    bindBtn('btn-sleep', () => {
        state.energy = 100;
        state.mood = Math.min(100, state.mood + 10);
        triggerActionAnimation('sleeping');
        showFloatingText("Entering Sleep Mode... 💤");
    });

    bindBtn('btn-follow', () => {
        const isFollowing = toggleFollowCursor();
        showFloatingText(isFollowing ? "Tracking Targets! 👀" : "Fixed Coordinates! 🛑");
    });
}

function showFloatingText(text) {
    const bubble = document.getElementById('pet-speech-bubble');
    if(bubble) {
        bubble.innerText = text;
        bubble.classList.remove('hidden');
        clearTimeout(bubble.timeoutId);
        bubble.timeoutId = setTimeout(() => {
            bubble.classList.add('hidden');
        }, 6000); 
    }
}
