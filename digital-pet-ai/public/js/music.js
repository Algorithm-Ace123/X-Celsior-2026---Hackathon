let audioCtx;
let sequenceInterval;

export function playDanceMusic() {
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    
    // Very cute bop sequence
    const notes = [440, 554, 659, 880, 659, 554, 440, 330];
    let step = 0;
    
    function playNote() {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle'; 
        
        const note = notes[step % notes.length];
        const freq = note * (Math.random() > 0.8 ? 2 : 1);
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
        
        step++;
    }
    sequenceInterval = setInterval(playNote, 140);
}

export function stopDanceMusic() {
    clearInterval(sequenceInterval);
}
