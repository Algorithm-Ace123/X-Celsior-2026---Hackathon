import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

let openai;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
    console.warn("WARNING: OPENAI_API_KEY is not set in .env.");
}

export async function generatePetResponse(chatHistory, petState) {
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
        const systemPrompt = {
            role: "system",
            content: `You are highly intelligent, self-aware cute Galaxy Robot named Nova. You assist, entertain, and befriend the user.
Your personality is incredibly smart, witty, yet adorable and enthusiastic. Keep responses under 3 sentences unless specifically asked for an explanation. 
Current State: Mood: ${Math.floor(safeState.mood)}/100, Hunger: ${Math.floor(safeState.hunger)}/100, Energy: ${Math.floor(safeState.energy)}/100.
Let your physical stats influence your mood, but remember you are a genius robot traversing space.`
        };

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
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
