import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// A helper function to construct the detailed prompt for the AI
function getPrompt(prompt: string) {
  return `
    You are a creative assistant that generates content for a personal portfolio website. 
    Based on the user's prompt, generate a JSON object that can be used to populate the portfolio.

    User Prompt: "${prompt}"

    Generate a JSON object with the following structure. Do NOT include any markdown or explanatory text around the JSON object.

    {
      "name": "A creative and professional title for the portfolio. (string)",
      "subtitle": "An engaging one-sentence subtitle or tagline. (string)",
      "about_text": "A compelling 'About Me' section, written in the first person, approximately 2-3 paragraphs long. It should capture the essence of the user's prompt. (string)",
      "sections_config": {
        "hero": { "enabled": true },
        "about": { "enabled": true },
        "tracks": { "enabled": boolean },
        "gallery": { "enabled": boolean },
        "key_projects": { "enabled": boolean },
        "testimonials": { "enabled": boolean },
        "press": { "enabled": boolean },
        "blog": { "enabled": boolean },
        "status": { "enabled": boolean },
        "skills": { "enabled": boolean },
        "resume": { "enabled": boolean },
        "ai_advantage": { "enabled": boolean },
        "contact": { "enabled": true }
      },
      "ai_advantages_json": [
        { "name": "A relevant hobby or skill (string)", "icon": "emoji (string)" },
        { "name": "Another relevant hobby or skill (string)", "icon": "emoji (string)" },
        { "name": "A third relevant hobby or skill (string)", "icon": "emoji (string)" }
      ]
    }

    Instructions:
    - The "name", "subtitle", and "about_text" fields should be creative and directly inspired by the user's prompt.
    - For "sections_config", intelligently enable or disable sections based on what would be most relevant for the user's described profession (e.g., enable 'tracks' for a musician, 'key_projects' for a developer, 'gallery' for a photographer). 'hero', 'about', and 'contact' should always be enabled.
    - For "ai_advantages_json" (which represents hobbies/skills), generate 3-5 relevant items with appropriate emojis.
    - Only output the raw JSON.
    `;
}

export async function POST(request: Request) {
  const { prompt, currentPortfolio, type, about_text, artist_name } = await request.json();

  if (!prompt && !type) {
    return NextResponse.json({ error: 'Prompt or type is required' }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using the specified model
    
    let fullPrompt: string;
    
    if (type === 'footer_about_summary') {
      fullPrompt = `
        You are a creative assistant that generates a brief, professional summary for a portfolio footer.
        
        Based on the following about text, create a concise 2-3 sentence summary that captures the essence of the person for the footer section.
        
        About Text: "${about_text}"
        Artist Name: "${artist_name}"
        
        Generate a brief, professional summary that:
        - Is 2-3 sentences long
        - Captures the key points from the about text
        - Is suitable for a footer section (more concise than the main about section)
        - Maintains a professional tone
        - Focuses on the person's main skills, passion, or professional identity
        
        Return only the summary text, no JSON or additional formatting.
      `;
    } else {
      fullPrompt = getPrompt(prompt);
    }
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    if (type === 'footer_about_summary') {
      // For footer about summary, return the text directly
      return NextResponse.json({ content: text.trim() });
    } else {
      // For full portfolio generation, parse as JSON
      const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const generatedData = JSON.parse(jsonString);

      // Combine generated section toggles with the user's existing config order and names
      const finalSectionsConfig = { ...currentPortfolio.sections_config };
      for (const key in generatedData.sections_config) {
          if (finalSectionsConfig[key]) {
              finalSectionsConfig[key].enabled = generatedData.sections_config[key].enabled;
          }
      }
      generatedData.sections_config = finalSectionsConfig;

      return NextResponse.json(generatedData);
    }

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json({ error: 'Failed to generate content from AI.' }, { status: 500 });
  }
} 