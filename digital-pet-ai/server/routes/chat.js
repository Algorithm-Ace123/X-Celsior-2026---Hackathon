import express from 'express';
import { generatePetResponse } from '../services/openai.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        // We gracefully accept both new 'messages' array and old cached 'message' string
        const { messages, message, petState } = req.body;
        const historyPayload = messages || message || "Hello";
        
        const reply = await generatePetResponse(historyPayload, petState);
        res.json({ reply });
    } catch (error) {
        console.error("Chat route error:", error);
        res.status(500).json({ error: 'Backend Routing Failed' });
    }
});

export default router;
