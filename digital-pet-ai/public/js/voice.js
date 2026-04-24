export function initVoice(onTextRecognized) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log("[Voice] Recognized:", transcript);
            onTextRecognized(transcript);
            
            const btnVoice = document.getElementById('btn-voice');
            if(btnVoice) btnVoice.style.background = '';
        };
        
        recognition.onerror = (e) => {
            console.error("[Voice] Speech Recognition Error", e);
            const btnVoice = document.getElementById('btn-voice');
            if(btnVoice) btnVoice.style.background = '';
        };

        recognition.onend = () => {
            const btnVoice = document.getElementById('btn-voice');
            if(btnVoice) btnVoice.style.background = '';
        };
    }

    const btnVoice = document.getElementById('btn-voice');
    if (btnVoice) {
        btnVoice.addEventListener('click', () => {
            if (recognition) {
                recognition.start();
                btnVoice.style.background = 'rgba(239, 68, 68, 0.4)';
                console.log('[Voice] Listening...');
            } else {
                alert('Speech recognition is not supported in this browser. Try Chrome or Edge.');
            }
        });
    }
}

export function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.4;
        window.speechSynthesis.speak(utterance);
    }
}
