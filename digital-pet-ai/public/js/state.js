export const state = {
    mood: 80,
    hunger: 50,
    energy: 100,
    affection: 50,
    
    update(deltaTime) {
        this.hunger = Math.max(0, this.hunger - deltaTime * 0.8);
        this.energy = Math.max(0, this.energy - deltaTime * 0.5);
        this.affection = Math.max(0, this.affection - deltaTime * 0.3);
        
        if (this.hunger < 25 || this.energy < 20) {
            this.mood = Math.max(0, this.mood - deltaTime * 2.0);
        } else if (this.affection > 50) {
            this.mood = Math.min(100, this.mood + deltaTime * 0.5);
        }
        
        const moodBar = document.getElementById('bar-mood');
        const hungerBar = document.getElementById('bar-hunger');
        const energyBar = document.getElementById('bar-energy');
        
        if (moodBar) moodBar.style.width = `${Math.floor(this.mood)}%`;
        if (hungerBar) hungerBar.style.width = `${Math.floor(this.hunger)}%`;
        if (energyBar) energyBar.style.width = `${Math.floor(this.energy)}%`;
    }
};
