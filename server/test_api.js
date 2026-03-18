import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const text = "I want to design a bedroom of the size 12*14.I need a bed,wardrobe and table with minimum design and suitable color pallette";
const prompt = `A photorealistic interior design of a room: ${text}, detailed, architectural digest, 4k`;

async function run() {
  console.log('Testing Hugging Face...');
  try {
    const hfRes = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: prompt })
    });
    
    console.log('HF Status:', hfRes.status);
    if (!hfRes.ok) {
      console.log('HF Error Body:', await hfRes.text());
    } else {
      console.log('HF Success!');
    }
  } catch(e) {
    console.log('HF Exception:', e.message);
  }

  console.log('\nTesting Pollinations...');
  try {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
    console.log('Pollinations URL:', url);
    const pollRes = await fetch(url);
    console.log('Pollinations Status:', pollRes.status);
    if (!pollRes.ok) {
      console.log('Pollinations Error Body:', await pollRes.text());
    } else {
      console.log('Pollinations Success!');
    }
  } catch(e) {
    console.log('Pollinations Exception:', e.message);
  }
}

run();
