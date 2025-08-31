import express from 'express';
import cors from 'cors';
import { MediaAgentOrchestrator, TelegramMessage } from './core/orchestrator/main';

const app = express();
// We'll use a different port for the backend to avoid conflicts with the frontend dev server
const port = process.env.BACKEND_PORT || 3001;

// ==================================
// Middlewares
// ==================================
app.use(cors()); // Allows requests from the frontend (running on a different port)
app.use(express.json()); // Parses incoming requests with JSON payloads

// ==================================
// Core Application Logic
// ==================================
// We create a single instance of our orchestrator to handle all requests
const orchestrator = new MediaAgentOrchestrator();

// ==================================
// API Routes
// ==================================

// A simple health check endpoint to verify that the server is running
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is healthy' });
});

// The main endpoint for handling chat messages from the web UI
app.post('/api/chat', async (req, res) => {
    try {
        const { message, chatId } = req.body;

        // Basic validation
        if (!message || !chatId) {
            return res.status(400).json({ error: 'Request body must contain "message" and "chatId" fields.' });
        }

        // We adapt the incoming web request to the `TelegramMessage` format that the orchestrator
        // currently expects. This can be refactored later to a more generic `ChatMessage` type.
        const orchestratorRequest: TelegramMessage = {
            type: 'text', // For now, we assume all web UI messages are text
            content: message,
            chatId: chatId,
        };

        const response = await orchestrator.routeRequest(orchestratorRequest);

        res.status(200).json(response);

    } catch (error) {
        console.error('Error processing /api/chat request:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});


// ==================================
// Start the Server
// ==================================
app.listen(port, () => {
    console.log(`Backend API server listening at http://localhost:${port}`);
});
