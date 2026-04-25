import { state } from './state.js';
import { speak } from './voice.js';
import { triggerActionAnimation } from './pet.js';

function mapSentimentToEmotion(sentiment) {
    const lower = sentiment.toLowerCase();
    if (lower.includes('sad')) return 'Sad';
    if (lower.includes('angry')) return 'Angry';
    if (lower.includes('lonely')) return 'Lonely';
    if (lower.includes('tired')) return 'Tired';
    if (lower.includes('hungry')) return 'Hungry';
    if (lower.includes('curious')) return 'Curious';
    if (lower.includes('excited')) return 'Joyful';
    if (lower.includes('happy')) return 'Joyful';
    return 'Content';
}

function mapSentimentToDeltas(sentiment) {
    const lower = sentiment.toLowerCase();
    switch (lower) {
        case 'happy':
        case 'excited':
            return { moodDelta: 8, affectionDelta: 4, energyDelta: 2 };
        case 'curious':
            return { moodDelta: 4, affectionDelta: 2, energyDelta: 0 };
        case 'sad':
            return { moodDelta: -8, affectionDelta: -2, energyDelta: 0 };
        case 'angry':
            return { moodDelta: -10, affectionDelta: -4, energyDelta: -1 };
        case 'lonely':
            return { moodDelta: -6, affectionDelta: -5, energyDelta: 0 };
        case 'tired':
            return { moodDelta: -4, affectionDelta: 0, energyDelta: -8 };
        case 'hungry':
            return { moodDelta: -3, affectionDelta: 0, energyDelta: -5 };
        case 'neutral':
            return { moodDelta: 0, affectionDelta: 0, energyDelta: 0 };
        default:
            return { moodDelta: 0, affectionDelta: 0, energyDelta: 0 };
    }
}

function detectExplicitEmotion(text) {
    const lower = text.toLowerCase();
    if (/\b(i['’]?m|i am|i'm|i\s+feel|feeling)\s+(sad|upset|depressed|down|blue)\b/.test(lower)) return 'Sad';
    if (/\b(i['’]?m|i am|i'm|i\s+feel|feeling)\s+(happy|glad|joyful|cheerful|excited|good)\b/.test(lower)) return 'Joyful';
    if (/\b(i['’]?m|i am|i'm|i\s+feel|feeling)\s+(tired|sleepy|exhausted|drained)\b/.test(lower)) return 'Tired';
    if (/\b(i['’]?m|i am|i'm|i\s+feel|feeling)\s+(lonely|alone|isolated)\b/.test(lower)) return 'Lonely';
    if (/\b(i['’]?m|i am|i'm|i\s+feel|feeling)\s+(hungry|starving|famished)\b/.test(lower)) return 'Hungry';
    if (lower.includes('curious') || lower.includes('interested') || lower.includes('wonder')) return 'Curious';
    return null;
}

function computeConversationImpact(userText, botText) {
    const lowerUser = userText.toLowerCase();
    const lowerBot = botText.toLowerCase();
    const positiveTriggers = ["love", "happy", "great", "awesome", "amazing", "cute", "fun", "thank", "yes", "yay", "friend", "nice", "good", "excited"];
    const negativeTriggers = ["sad", "angry", "hate", "bad", "upset", "tired", "lonely", "no", "hurt", "terrible", "scared", "meh", "depressed", "down"];
    const affectionTriggers = ["love", "miss", "hug", "care", "friend", "best", "cute", "sweet", "cherish"];

    let moodDelta = 0;
    let affectionDelta = 0;
    let energyDelta = 0;

    positiveTriggers.forEach((word) => {
        if (lowerUser.includes(word)) moodDelta += 4;
        if (lowerBot.includes(word)) moodDelta += 2;
    });
    negativeTriggers.forEach((word) => {
        if (lowerUser.includes(word)) moodDelta -= 6;
        if (lowerBot.includes(word)) moodDelta -= 3;
    });
    affectionTriggers.forEach((word) => {
        if (lowerUser.includes(word)) affectionDelta += 5;
        if (lowerBot.includes(word)) affectionDelta += 2;
    });

    if (lowerUser.includes('tired') || lowerBot.includes('tired')) energyDelta -= 5;
    if (lowerUser.includes('sleep') || lowerBot.includes('sleep')) energyDelta += 5;
    if (lowerUser.includes('play') || lowerBot.includes('play')) moodDelta += 3;
    if (lowerUser.includes('feed') || lowerBot.includes('fed')) moodDelta += 3;
    if (lowerUser.includes('dance') || lowerBot.includes('dance')) moodDelta += 2;

    return { moodDelta, affectionDelta, energyDelta };
}

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
        typingMsg.innerText = "Learning from your words...";
        chatDisplay.appendChild(typingMsg);
        scrollToBottom();

        try {
            const contextData = {
                time: new Date().toLocaleTimeString(),
                personality: localStorage.getItem('pet_personality') || "Friendly and curious"
            };

            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: messageHistory, petState: state, context: contextData })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }
            
            const data = await response.json();
            
            let replyText = data.reply;
            let actionType = "none";
            let sentimentLabel = null;
            try {
                // OpenAI returns a JSON string in data.reply due to response_format: "json_object"
                const parsed = JSON.parse(data.reply);
                if (parsed.message) replyText = parsed.message;
                if (parsed.action) actionType = parsed.action;
                if (parsed.sentiment) sentimentLabel = parsed.sentiment;
            } catch(e) { 
                console.warn("Failed to parse JSON response, falling back to raw text", e); 
            }

            if (actionType && actionType !== "none" && actionType !== "idle") {
                triggerActionAnimation(actionType);
            }

            if (sentimentLabel) {
                const sentimentDeltas = mapSentimentToDeltas(sentimentLabel);
                state.mood = Math.min(100, Math.max(0, state.mood + sentimentDeltas.moodDelta));
                state.affection = Math.min(100, Math.max(0, state.affection + sentimentDeltas.affectionDelta));
                state.energy = Math.min(100, Math.max(0, state.energy + sentimentDeltas.energyDelta));
                state.currentEmotion = mapSentimentToEmotion(sentimentLabel);
                localStorage.setItem('pet_emotion', state.currentEmotion);
            } else {
                const impact = computeConversationImpact(text, replyText);
                state.mood = Math.min(100, Math.max(0, state.mood + impact.moodDelta));
                state.affection = Math.min(100, Math.max(0, state.affection + impact.affectionDelta));
                state.energy = Math.min(100, Math.max(0, state.energy + impact.energyDelta));

                const explicitEmotion = detectExplicitEmotion(text);
                if (explicitEmotion) {
                    state.currentEmotion = explicitEmotion;
                    localStorage.setItem('pet_emotion', explicitEmotion);
                }
            }

            chatDisplay.removeChild(typingMsg);
            
            state.learning = Math.min(100, state.learning + Math.min(10, text.trim().length / 12 + replyText.length / 40));
            state.experience += 8;
            if (!sentimentLabel) {
                state.recomputeEmotion?.();
            }
            messageHistory.push({ role: "assistant", content: replyText });
            if(messageHistory.length > 8) messageHistory.shift();
            
            const aiMsg = document.createElement('div');
            aiMsg.className = 'chat-msg pet-msg';
            chatDisplay.appendChild(aiMsg);
            
            let charIndex = 0;
            function typeChar() {
                if (charIndex < replyText.length) {
                    aiMsg.innerHTML += replyText.charAt(charIndex);
                    charIndex++;
                    scrollToBottom();
                    setTimeout(typeChar, 30);
                } else {
                    fadeAfter(aiMsg, 20000);
                }
            }
            typeChar();
            speak(replyText);
            
            const bubble = document.getElementById('pet-speech-bubble');
            if(bubble) {
                bubble.innerText = "I learned something new! ✨";
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
