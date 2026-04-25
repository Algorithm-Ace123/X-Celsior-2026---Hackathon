import { state } from './state.js';
import { triggerActionAnimation, toggleFollowCursor } from './pet.js';
import { playDanceMusic } from './music.js';

let pettingStreak = 0;
let lastPetTime = 0;

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
        let hungerGain = 40;
        let moodBonus = 15;
        
        // Nutritional Bonus: Feeding when slightly hungry gives a "Satisfaction" bonus
        if (state.hunger > 30 && state.hunger < 70) {
            moodBonus += 10;
            state.experience += 5;
        } else if (state.hunger >= 80) {
            // Overfeeding gives less benefit
            hungerGain = 15;
            moodBonus = 5;
        }

        state.hunger = Math.min(100, state.hunger + hungerGain);
        state.affection = Math.min(100, state.affection + 10);
        state.mood = Math.min(100, state.mood + moodBonus);
        state.learning = Math.min(100, state.learning + 4);
        state.experience += 7;
        state.recomputeEmotion();
        triggerActionAnimation('feeding');
        state.saveProgress();
        showFloatingText(state.hunger >= 80 ? "The companion is full but appreciates the treat." : "The companion has been fed and is feeling energized.");
    });
    
    bindBtn('btn-play', () => {
        if (state.energy < 20) {
            showFloatingText("The companion is too tired to play right now. It needs some rest.");
            return;
        }
        state.mood = Math.min(100, state.mood + 30);
        state.energy = Math.max(0, state.energy - 25);
        state.learning = Math.min(100, state.learning + 8);
        state.experience += 10;
        state.recomputeEmotion();
        triggerActionAnimation('playing');
        state.saveProgress();
        showFloatingText("The companion is enjoying the playtime with you.");
    });

    bindBtn('btn-dance', () => {
        if (state.energy < 30) {
            showFloatingText("The companion doesn't have enough energy to dance at the moment.");
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
        showFloatingText("The companion is dancing along to the rhythm.");
    });

    bindBtn('btn-pet', () => {
        const now = Date.now();
        if (now - lastPetTime < 2500) {
            pettingStreak++;
        } else {
            pettingStreak = 1;
        }
        lastPetTime = now;

        const streakBonus = Math.min(15, pettingStreak * 2);
        state.affection = Math.min(100, state.affection + 20 + streakBonus);
        state.mood = Math.min(100, state.mood + 15 + (streakBonus * 0.5));
        state.learning = Math.min(100, state.learning + 10);
        state.experience += 8 + Math.floor(streakBonus * 0.5);
        state.recomputeEmotion();
        triggerActionAnimation('playing');
        state.saveProgress();
        
        let message = "The companion appreciates the affection.";
        if (pettingStreak > 3) message = `Affection streak! The companion is deeply enjoying this.`;
        showFloatingText(message);
    });

    bindBtn('btn-sleep', () => {
        state.energy = 100;
        state.mood = Math.min(100, state.mood + 10);
        state.learning = Math.min(100, state.learning + 5);
        state.experience += 5;
        state.recomputeEmotion();
        triggerActionAnimation('sleeping');
        state.saveProgress();
        showFloatingText("The companion is resting and regaining its strength.");
    });

    bindBtn('btn-follow', () => {
        const isFollowing = toggleFollowCursor();
        state.learning = Math.min(100, state.learning + 2);
        state.experience += 3;
        state.recomputeEmotion();
        state.saveProgress();
        showFloatingText(isFollowing ? "The companion is now following your movements." : "The companion has stopped following.");
    });

    bindBtn('btn-style', () => {
        const unlocked = state.unlockedStyles;
        state.styleIndex = ((state.styleIndex || 0) + 1) % unlocked.length;
        const currentStyle = unlocked[state.styleIndex];
        showFloatingText(`Appearance changed to: ${currentStyle}`);
        state.saveProgress();
    });

    const helpBtn = document.getElementById('btn-help');
    const helpModal = document.getElementById('help-modal');
    const closeHelp = document.getElementById('close-help');

    if(helpBtn && helpModal && closeHelp) {
        helpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            helpModal.classList.remove('hidden');
        });

        closeHelp.addEventListener('click', () => {
            helpModal.classList.add('hidden');
        });

        helpModal.addEventListener('click', (e) => {
            if(e.target === helpModal) {
                helpModal.classList.add('hidden');
            }
        });
    }
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
