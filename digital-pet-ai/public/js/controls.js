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
        state.learning = Math.min(100, state.learning + 4);
        state.experience += 7;
        state.recomputeEmotion();
        triggerActionAnimation('feeding');
        state.saveProgress();
        showFloatingText("Energy refilled! 🔋 Your companion is learning care routines.");
    });
    
    bindBtn('btn-play', () => {
        if (state.energy < 20) {
            showFloatingText("System low power... 💤 Try Sleep first.");
            return;
        }
        state.mood = Math.min(100, state.mood + 30);
        state.energy = Math.max(0, state.energy - 25);
        state.learning = Math.min(100, state.learning + 8);
        state.experience += 10;
        state.recomputeEmotion();
        triggerActionAnimation('playing');
        state.saveProgress();
        showFloatingText("Play mode engaged! Your companion is forging stronger bonds.");
    });

    bindBtn('btn-dance', () => {
        if (state.energy < 30) {
            showFloatingText("Need recharge! ⚡ Save the groove for later.");
            return;
        }
        state.mood = Math.min(100, state.mood + 40);
        state.energy = Math.max(0, state.energy - 35);
        state.learning = Math.min(100, state.learning + 12);
        state.experience += 15;
        state.recomputeEmotion();
        triggerActionAnimation('dancing');
        playDanceMusic();
        state.saveProgress();
        showFloatingText("Hyperdrive active! Your pet is syncing to your energy.");
    });

    bindBtn('btn-pet', () => {
        state.affection = Math.min(100, state.affection + 25);
        state.mood = Math.min(100, state.mood + 20);
        state.learning = Math.min(100, state.learning + 10);
        state.experience += 8;
        state.recomputeEmotion();
        triggerActionAnimation('playing');
        state.saveProgress();
        showFloatingText("Sensor feedback positive! Connection deepened.");
    });

    bindBtn('btn-sleep', () => {
        state.energy = 100;
        state.mood = Math.min(100, state.mood + 10);
        state.learning = Math.min(100, state.learning + 5);
        state.experience += 5;
        state.recomputeEmotion();
        triggerActionAnimation('sleeping');
        state.saveProgress();
        showFloatingText("Entering Sleep Mode... Recharge and grow.");
    });

    bindBtn('btn-follow', () => {
        const isFollowing = toggleFollowCursor();
        state.learning = Math.min(100, state.learning + 2);
        state.experience += 3;
        state.recomputeEmotion();
        state.saveProgress();
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
