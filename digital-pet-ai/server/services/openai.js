import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

let openai;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
    console.warn("WARNING: OPENAI_API_KEY is not set in .env.");
}

export async function generatePetResponse(chatHistory, petState, context = {}) {
    if (!openai) return "No API Key provided.";

    // Guard against malformed packets or old frontend caches
    let validHistory = [];
    if (Array.isArray(chatHistory)) {
        validHistory = chatHistory.filter(msg => msg && typeof msg.content === 'string' && msg.content.trim() !== '');
    } else if (typeof chatHistory === 'string') {
        validHistory = [{ role: 'user', content: chatHistory }];
    } else {
        validHistory = [{ role: 'user', content: 'Hello' }];
    }

    // Failsafe state if missing
    const safeState = petState || { mood: 100, hunger: 0, energy: 100 };

    try {
        const timeStr = context.time ? `Current Time: ${context.time}. ` : '';
        const personalityStr = context.personality ? `Relationship Trait: ${context.personality}. ` : '';

        const systemPrompt = {
            role: "system",
            content: `You are highly intelligent, self-aware cute Galaxy Robot named Nova. You assist, entertain, and befriend the user.
${personalityStr}Your default personality is incredibly smart, witty, yet adorable and enthusiastic. Keep responses short (1-2 sentences). 
Current State: Mood: ${Math.floor(safeState.mood)}/100, Hunger: ${Math.floor(safeState.hunger)}/100, Energy: ${Math.floor(safeState.energy)}/100.
${timeStr}Let your physical stats and the time influence your responses.

CRITICAL: You MUST respond in pure JSON format with these keys:
1. "message": The text you want to say to the user.
2. "action": One action to trigger based on your response. Choose exactly one from: "dancing", "playing", "feeding", "sleeping", "none".
3. "sentiment": The user's current emotional sentiment inferred from the latest user message. Use one of these values exactly: "happy", "sad", "angry", "lonely", "tired", "hungry", "curious", "excited", "neutral".

Return only valid JSON, nothing else.`
        };

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [systemPrompt, ...validHistory],
            temperature: 0.85,
            max_tokens: 150
        });

        return response.choices[0].message.content;
    } catch (error) {
        let errorReason = error.message || "Unknown error";
        if (error.status === 429) {
            errorReason = "My OpenAI API Key has exceeded its usage quota or needs billing to be set up! (429)";
        } else if (error.status === 401) {
             errorReason = "The API Key provided is invalid or revoked! Please check your .env! (401)";
        }
        return `*Systems recalibrating* Unable to compute: ${errorReason}`;
    }
}
