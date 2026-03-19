import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// Initialize Supabase if keys are provided
const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  const userMessage = messages[messages.length - 1]?.text || "";

  if (OPENAI_API_KEY) {
    try {
      const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an AI Interior Design App assistant. Parse user requirements and end by saying you generated designs based on their input.' },
            ...messages.map(m => ({ role: m.sender === 'ai' ? 'assistant' : 'user', content: m.text }))
          ]
        })
      });
      const data = await gptRes.json();
      return res.json({ reply: data.choices[0].message.content });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'LLM Error' });
    }
  }

  await new Promise(resolve => setTimeout(resolve, 1500));
  return res.json({ 
    reply: `I've analyzed your request: "${userMessage}". I've generated some designs based on your requirements! You can view them on the right. Select one to tweak its colors, lighting, or furniture arrangement.` 
  });
});

app.post('/api/generate-image', async (req, res) => {
  const { prompt, socketId } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const sendProgress = (message, percent) => {
    if (socketId) {
      io.to(socketId).emit('progress', { message, percent });
    }
  };

  sendProgress('Initializing AI generation...', 10);

  try {
    let finalUrls = [];

    if (GEMINI_API_KEY && ai) {
      sendProgress('Triggering Gemini Image model...', 20);
      
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 4,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1'
        }
      });

      sendProgress('Gemini processing complete!', 80);
      
      finalUrls = response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
      
      // Pad out to 5 images so UI does not crash if it expects exactly 5
      while (finalUrls.length > 0 && finalUrls.length < 5) {
          finalUrls.push(finalUrls[finalUrls.length - 1]);
      }
      
      sendProgress('Saving generated models...', 90);
      
      return res.json({ imageUrls: finalUrls });
    } else if (OPENAI_API_KEY) {
      sendProgress('Triggering OpenAI DALL-E model...', 20);
      
      const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'dall-e-2',
          prompt: prompt.substring(0, 1000), // OpenAI limit is 1000 chars
          n: 5,
          size: '1024x1024'
        })
      });

      if (!openaiRes.ok) {
        const errText = await openaiRes.text();
        console.error('OpenAI Error:', errText);
        throw new Error(`OpenAI responded with ${openaiRes.status}`);
      }

      const openaiData = await openaiRes.json();
      sendProgress('OpenAI processing complete!', 80);
      
      finalUrls = openaiData.data.map(item => item.url);
      
      sendProgress('Saving generated models...', 90);
      
      return res.json({ imageUrls: finalUrls });
    } else {
      throw new Error("No OpenAI key found");
    }

  } catch (error) {
    console.error('Error generating image:', error.message);
    sendProgress('API unavailable. Falling back to free Pollinations AI...', 50);
    
    try {
      let finalUrls = [];
      for (let i = 1; i <= 4; i++) {
        const seed = Math.floor(Math.random() * 1000000) + i;
        finalUrls.push(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`);
      }
      while (finalUrls.length > 0 && finalUrls.length < 5) {
          finalUrls.push(finalUrls[finalUrls.length - 1]);
      }
      sendProgress('Pollinations processing complete!', 90);
      return res.json({ imageUrls: finalUrls });
    } catch (pollinationsErr) {
      console.error('Pollinations fallback failed:', pollinationsErr.message);
      try {
        // Fallback to local image 
        const __dirname = path.resolve();
        const imagePath = path.join(__dirname, '..', 'public', 'design1.png');
        const fileBuffer = fs.readFileSync(imagePath);
        const base64Image = `data:image/png;base64,${fileBuffer.toString('base64')}`;
        
        sendProgress('Complete (Offline Cache)!', 100);
        return res.json({ imageUrls: [base64Image, base64Image, base64Image, base64Image, base64Image] });
      } catch (fallbackErr) {
        console.error('Ultimate fallback failed:', fallbackErr.message);
        res.status(500).json({ error: 'Failed to generate image' });
      }
    }
  }
});

// GET endpoint to fetch gallery items from Database
app.get('/api/gallery', async (req, res) => {
  if (!supabase) {
    return res.json({ designs: [], warning: 'Supabase not connected' });
  }
  
  try {
    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.json({ designs: data || [] });
  } catch (err) {
    console.error('Failed to fetch gallery:', err);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`AI Backend server running on http://localhost:${PORT}`);
});
