import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    console.log("Testing text generation to see if key works...");
    const textRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Hello!'
    });
    console.log("Text success:", textRes.text);

    console.log("Testing image generation...");
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: 'A beautiful sunset over the mountains',
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1'
      }
    });
    console.log("Image generation success. Images:", response.generatedImages?.length);
  } catch (err) {
    console.error("ERROR:", err);
  }
}
run();
