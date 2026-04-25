import { sendNotification } from './notifications.js';

export const state = {
    mood: 80,
    hunger: 50,
    energy: 100,
    affection: 50,
    learning: Number(localStorage.getItem('pet_learning') || '8'),
    experience: Number(localStorage.getItem('pet_experience') || '0'),
    level: Number(localStorage.getItem('pet_level') || '1'),
    currentEmotion: localStorage.getItem('pet_emotion') || 'Content',
    weather: 'Clear', // Default weather

    get expToNextLevel() {
        return this.level * 100;
    },

    get unlockedStyles() {
        const styles = ['Default'];
        if (this.level >= 3) styles.push('Neon');
        if (this.level >= 5) styles.push('Gold');
        if (this.level >= 10) styles.push('Stellar');
        return styles;
    },

    get growthStage() {
        const score = this.mood + this.affection + this.learning * 1.25;
        if (score > 260) return "Fully Evolved";
        if (score > 180) return "Young Companion";
        return "New Life";
    },

    get emotion() {
        return this.currentEmotion;
    },

    recomputeEmotion() {
        const previous = this.currentEmotion;
        if (this.energy < 22) this.currentEmotion = "Tired";
        else if (this.hunger < 25) this.currentEmotion = "Hungry";
        else if (this.mood < 35) this.currentEmotion = "Sad";
        else if (this.affection < 30) this.currentEmotion = "Lonely";
        else if (this.mood > 80 && this.affection > 80) this.currentEmotion = "Joyful";
        else if (this.learning > 75) this.currentEmotion = "Curious";
        else this.currentEmotion = "Content";
        if (previous !== this.currentEmotion) {
            localStorage.setItem('pet_emotion', this.currentEmotion);
        }
    },

    get personality() {
        return localStorage.getItem('pet_personality') || "Friendly and curious";
    },

    saveProgress() {
        localStorage.setItem('pet_learning', String(Math.floor(this.learning)));
        localStorage.setItem('pet_experience', String(Math.floor(this.experience)));
        localStorage.setItem('pet_level', String(this.level));
        localStorage.setItem('pet_personality', this.personality);
        localStorage.setItem('pet_emotion', this.currentEmotion);
    },

    async fetchWeather() {
        try {
            // Using ?format=1 for a cleaner "Icon Condition" string
            const res = await fetch('https://wttr.in/?format=1');
            if (res.ok) {
                const text = await res.text();
                // Basic check: if it looks like HTML, it's probably an error page
                if (text.trim().startsWith('<!DOCTYPE') || text.includes('<html')) {
                    this.weather = 'Clear';
                } else {
                    this.weather = text.trim();
                }
                console.log("Current weather detected:", this.weather);
            }
        } catch (e) {
            console.log("Weather fetch failed, defaulting to Clear.");
            this.weather = 'Clear';
        }
    },

    update(deltaTime) {
        // Base decay rates
        let hungerDecay = 0.8;
        let energyDecay = 0.5;
        let affectionDecay = 0.28;

        // Synergistic Decay: Stats drop faster if other needs are neglected
        if (this.energy < 30) hungerDecay *= 1.5; // Being tired makes you hungrier
        if (this.hunger < 30) energyDecay *= 1.5; // Being hungry makes you tired
        
        // Weather Reactivity: Lazy when rainy, energetic when clear
        if (this.weather.toLowerCase().includes('rain') || this.weather.toLowerCase().includes('cloud')) {
            energyDecay *= 1.3; // Drains energy faster (lethargy)
            this.mood -= deltaTime * 0.5;
        } else if (this.weather.toLowerCase().includes('sun') || this.weather.toLowerCase().includes('clear')) {
            energyDecay *= 0.8; // More energetic
            this.mood += deltaTime * 0.2;
        }

        if (this.hunger < 20) this.mood -= deltaTime * 1.5; // Severe hunger impacts mood directly

        // Well-loved Bonus: High affection slows down decay
        if (this.affection > 90) {
            hungerDecay *= 0.7;
            energyDecay *= 0.7;
            affectionDecay *= 0.5;
        }

        this.hunger = Math.max(0, this.hunger - deltaTime * hungerDecay);
        this.energy = Math.max(0, this.energy - deltaTime * energyDecay);
        this.affection = Math.max(0, this.affection - deltaTime * affectionDecay);

        const learningGain = deltaTime * 0.02 * Math.max(0.25, this.mood / 100);
        this.learning = Math.min(100, this.learning + learningGain);

        if (this.hunger < 25 || this.energy < 20) {
            this.mood = Math.max(0, this.mood - deltaTime * 2.0);
        } else if (this.affection > 50) {
            this.mood = Math.min(100, this.mood + deltaTime * 0.6);
        }

        if (this.energy < 20 && this.mood > 40) {
            this.mood = Math.max(0, this.mood - deltaTime * 0.8);
        }

        let currentPersonality;
        if (this.mood < 30 && this.affection < 30) {
            currentPersonality = "Sassy, grumpy, and slightly demanding";
        } else if (this.mood > 80 && this.affection > 80) {
            currentPersonality = "Incredibly affectionate, cheerful, and loving";
        } else if (this.energy < 30) {
            currentPersonality = "Sleepy, lethargic, and slow to respond";
        } else {
            currentPersonality = "Friendly, witty, and curious";
        }
        localStorage.setItem('pet_personality', currentPersonality);

        this.recomputeEmotion();

        const stageLabel = document.getElementById('pet-stage-label');
        if (stageLabel) stageLabel.innerText = `Growth Stage: ${this.growthStage}`;
        
        const emotionLabel = document.getElementById('pet-emotion-label');
        if (emotionLabel) emotionLabel.innerText = `Current Emotion: ${this.emotion}`;

        const levelLabel = document.getElementById('pet-level-label');
        if (levelLabel) levelLabel.innerText = `Current Level: ${this.level} (${Math.floor(this.experience)}/${this.expToNextLevel} EXP)`;

        const weatherLabel = document.getElementById('weather-label');
        if (weatherLabel) weatherLabel.innerText = `Environment: ${this.weather}`;

        const bonusLabel = document.getElementById('bonus-label');
        if (bonusLabel) {
            if (this.affection > 90) {
                bonusLabel.innerText = `Active Status: Well-loved`;
                bonusLabel.classList.remove('hidden');
            } else {
                bonusLabel.classList.add('hidden');
            }
        }
        const moodBar = document.getElementById('bar-mood');
        const hungerBar = document.getElementById('bar-hunger');
        const energyBar = document.getElementById('bar-energy');
        if (moodBar) moodBar.style.width = `${Math.floor(this.mood)}%`;
        if (hungerBar) hungerBar.style.width = `${Math.floor(this.hunger)}%`;
        if (energyBar) energyBar.style.width = `${Math.floor(this.energy)}%`;

        this.saveProgress();

        if (this.energy < 15) {
            sendNotification('energy', "Your companion is exhausted and needs rest.");
        }

        // Level Up logic
        if (this.experience >= this.expToNextLevel) {
            this.experience -= this.expToNextLevel;
            this.level++;
            this.saveProgress();
            
            const bubble = document.getElementById('pet-speech-bubble');
            if(bubble) {
                bubble.innerText = `The companion has reached Level ${this.level}! New rewards unlocked.`;
                bubble.classList.remove('hidden');
                clearTimeout(bubble.timeoutId);
                bubble.timeoutId = setTimeout(() => bubble.classList.add('hidden'), 5000);
            }
        }
    }
};
