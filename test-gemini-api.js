const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiAPI() {
  console.log('Testing Gemini API connection...');
  console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
  console.log('API Key length:', process.env.GEMINI_API_KEY?.length);
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('No GEMINI_API_KEY found in environment variables');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('Sending test request to Gemini API...');
    const result = await model.generateContent('Say "Hello, this is a test"');
    const response = await result.response;
    const text = response.text();
    
    console.log('Success! Gemini API response:', text);
  } catch (error) {
    console.error('Error testing Gemini API:', error);
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
  }
}

testGeminiAPI(); 