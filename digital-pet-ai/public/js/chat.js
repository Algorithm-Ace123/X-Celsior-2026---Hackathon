import { state } from './state.js';
import { speak } from './voice.js';

export function initChat() {
    const chatInput = document.getElementById('chat-input');
    const chatSubmit = document.getElementById('btn-submit');
    const chatDisplay = document.getElementById('chat-history');
    
    let messageHistory = [];

    async function sendMessage(text) {
        if (!text.trim()) return;

        messageHistory.push({ role: "user", content: text });
        if(messageHistory.length > 8) messageHistory.shift();

        const userMsg = document.createElement('div');
        userMsg.className = 'chat-msg user-msg';
        userMsg.innerText = text;
        chatDisplay.appendChild(userMsg);
        
        fadeAfter(userMsg, 15000);

        chatInput.value = '';
        scrollToBottom();

        const typingMsg = document.createElement('div');
        typingMsg.className = 'chat-msg pet-msg';
        typingMsg.innerText = "Processing computational vectors...";
        chatDisplay.appendChild(typingMsg);
        scrollToBottom();

        try {
            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: messageHistory, petState: state })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }
            
            const data = await response.json();
            
            chatDisplay.removeChild(typingMsg);
            
            messageHistory.push({ role: "assistant", content: data.reply });
            if(messageHistory.length > 8) messageHistory.shift();
            
            const aiMsg = document.createElement('div');
            aiMsg.className = 'chat-msg pet-msg';
            chatDisplay.appendChild(aiMsg);
            
            let charIndex = 0;
            function typeChar() {
                if (charIndex < data.reply.length) {
                    aiMsg.innerHTML += data.reply.charAt(charIndex);
                    charIndex++;
                    scrollToBottom();
                    setTimeout(typeChar, 30);
                } else {
                    fadeAfter(aiMsg, 20000);
                }
            }
            typeChar();
            speak(data.reply);
            
            const bubble = document.getElementById('pet-speech-bubble');
            if(bubble) {
                bubble.innerText = "Data incoming! 📡";
                bubble.classList.remove('hidden');
                clearTimeout(bubble.timeoutId);
                bubble.timeoutId = setTimeout(() => bubble.classList.add('hidden'), 6000);
            }

        } catch (e) {
            console.error(e);
            if(chatDisplay.contains(typingMsg)) chatDisplay.removeChild(typingMsg);
            const errMsg = document.createElement('div');
            errMsg.className = 'chat-msg pet-msg';
            errMsg.innerText = `*Error* Connection failed: ${e.message}`;
            chatDisplay.appendChild(errMsg);
            fadeAfter(errMsg, 25000); // Leave error visible longer to read it
        }
    }

    function fadeAfter(element, ms) {
        setTimeout(() => {
            element.style.opacity = '0';
            setTimeout(() => element.remove(), 1000); 
        }, ms);
    }

    function scrollToBottom() {
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    if(chatSubmit) chatSubmit.addEventListener('click', () => sendMessage(chatInput.value));
    if(chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage(chatInput.value);
        });
    }
    return { sendMessage };
}
