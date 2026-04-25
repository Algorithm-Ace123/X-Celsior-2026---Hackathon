export const state = {
    mood: 80,
    hunger: 50,
    energy: 100,
    affection: 50,
    learning: Number(localStorage.getItem('pet_learning') || '8'),
    experience: Number(localStorage.getItem('pet_experience') || '0'),
    currentEmotion: localStorage.getItem('pet_emotion') || 'Content',

    get growthStage() {
        const score = this.mood + this.affection + this.learning * 1.25;
        if (score > 260) return "Evolved Digital Companion";
        if (score > 180) return "Curious Companion";
        return "New Spark";
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
        localStorage.setItem('pet_personality', this.personality);
        localStorage.setItem('pet_emotion', this.currentEmotion);
    },

    update(deltaTime) {
        this.hunger = Math.max(0, this.hunger - deltaTime * 0.8);
        this.energy = Math.max(0, this.energy - deltaTime * 0.5);
        this.affection = Math.max(0, this.affection - deltaTime * 0.28);

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
        if (stageLabel) stageLabel.innerText = `Stage: ${this.growthStage}`;

        const emotionLabel = document.getElementById('pet-emotion-label');
        if (emotionLabel) emotionLabel.innerText = `Emotion: ${this.emotion}`;

        const moodBar = document.getElementById('bar-mood');
        const hungerBar = document.getElementById('bar-hunger');
        const energyBar = document.getElementById('bar-energy');
        if (moodBar) moodBar.style.width = `${Math.floor(this.mood)}%`;
        if (hungerBar) hungerBar.style.width = `${Math.floor(this.hunger)}%`;
        if (energyBar) energyBar.style.width = `${Math.floor(this.energy)}%`;

        this.saveProgress();
    }
};
