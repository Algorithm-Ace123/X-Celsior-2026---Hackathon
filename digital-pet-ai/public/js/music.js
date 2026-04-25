let audioCtx;
let sequenceInterval;
let analyser;
let micSource;

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

export function initAudioReactivity(onLoudSound) {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => {
          if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          if(audioCtx.state === 'suspended') audioCtx.resume();
          
          micSource = audioCtx.createMediaStreamSource(stream);
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          micSource.connect(analyser);
          
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          let lastLoudTime = 0;
          
          function checkAudio() {
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for(let i=0; i<dataArray.length; i++) sum += dataArray[i];
              const avg = sum / dataArray.length;
              
              const now = Date.now();
              // Trigger on loud sounds, with a 5 second cooldown
              if (avg > 40 && (now - lastLoudTime) > 5000) { 
                  lastLoudTime = now;
                  onLoudSound(avg);
              }
              requestAnimationFrame(checkAudio);
          }
          checkAudio();
      })
      .catch(err => console.log('[Audio Reactivity] Microphone access disabled or denied', err));
}
