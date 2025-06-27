import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// A helper function to construct the detailed prompt for the AI
function getPrompt(prompt: string, templateName?: string) {
  let templateSpecificInstructions = "";
  
  if (templateName === 'Photo Gallery') {
    templateSpecificInstructions = `
    Template: Photo Gallery - This is a photography-focused portfolio template.
    
    Photography-specific guidelines:
    - Focus on photography skills, techniques, and styles
    - Include photography-related hobbies and interests
    - Emphasize visual storytelling and creative vision
    - Use photography terminology and concepts
    - Include both technical and artistic aspects of photography
    - Consider different photography genres (portrait, landscape, street, wedding, etc.)
    `;
  } else if (templateName === 'Music Maestro') {
    templateSpecificInstructions = `
    Template: Music Maestro - This is a music-focused portfolio template.
    
    Music-specific guidelines:
    - Focus on musical skills, instruments, and genres
    - Include music-related hobbies and interests
    - Emphasize musical creativity and performance
    - Use music terminology and concepts
    - Include both performance and production aspects
    - Consider different musical styles and instruments
    `;
  }

  return `
    You are a creative assistant that generates content for a personal portfolio website. 
    Based on the user's prompt, generate a JSON object that can be used to populate the portfolio.

    User Prompt: "${prompt}"
    ${templateSpecificInstructions}

    Generate a JSON object with the following structure. Do NOT include any markdown or explanatory text around the JSON object.

    {
      "name": "A creative and professional title for the portfolio. (string)",
      "subtitle": "An engaging one-sentence subtitle or tagline. (string)",
      "hero_title": "A compelling hero section title. (string)",
      "hero_subtitle": "A brief hero section subtitle or tagline. (string)",
      "about_title": "Title for the about section. (string)",
      "about_text": "A compelling 'About Me' section, written in the first person, approximately 2-3 paragraphs long. It should capture the essence of the user's prompt. (string)",
      "contact_title": "Title for the contact section. (string)",
      "contact_description": "A brief description for the contact section. (string)",
      "contact_email": "A professional email address based on the user's profession. (string)",
      "skills_title": "Title for the skills section. (string)",
      "skills_json": [
        { "name": "A relevant skill (string)", "color": "hex color code (string)" },
        { "name": "Another relevant skill (string)", "color": "hex color code (string)" },
        { "name": "A third relevant skill (string)", "color": "hex color code (string)" }
      ],
      "hobbies_title": "Title for the hobbies section. (string)",
      "hobbies_json": [
        { "name": "A relevant hobby or interest (string)", "icon": "emoji (string)" },
        { "name": "Another relevant hobby or interest (string)", "icon": "emoji (string)" },
        { "name": "A third relevant hobby or interest (string)", "icon": "emoji (string)" }
      ],
      "resume_title": "Title for the resume section. (string)",
      "footer_about_summary": "A brief 2-3 sentence summary for the footer section based on the about text. (string)",
      "sections_config": {
        "hero": { "enabled": true },
        "about": { "enabled": true, "title": "About Me" },
        "tracks": { "enabled": boolean, "title": "string" },
        "gallery": { "enabled": boolean, "title": "string" },
        "key_projects": { "enabled": boolean, "title": "string" },
        "testimonials": { "enabled": boolean, "title": "string" },
        "press": { "enabled": boolean, "title": "string" },
        "blog": { "enabled": boolean, "title": "string" },
        "status": { "enabled": boolean, "title": "string" },
        "skills": { "enabled": boolean, "title": "string" },
        "resume": { "enabled": boolean, "title": "string" },
        "hobbies": { "enabled": boolean, "title": "string" },
        "contact": { "enabled": true, "title": "string" }
      }
    }

    Instructions:
    - The "name", "subtitle", "hero_title", "hero_subtitle", "about_title", and "about_text" fields should be creative and directly inspired by the user's prompt.
    - For "contact_title", "contact_description", and "contact_email", generate appropriate contact information based on the profession.
    - For "skills_title" and "skills_json", generate 3-5 relevant technical or professional skills with appropriate colors (use hex codes like "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7").
    - For "hobbies_title" and "hobbies_json", generate 3-5 relevant hobbies or interests with appropriate emojis.
    - For "resume_title", generate an appropriate title for the resume section.
    - For "footer_about_summary", create a concise 2-3 sentence summary based on the about_text that's suitable for a footer section.
    - For "sections_config", intelligently enable or disable sections based on what would be most relevant for the user's described profession. Enable sections that make sense for their work:
      * For musicians: enable 'tracks', 'gallery' (performance photos), 'press' (reviews), 'skills' (instruments), 'hobbies' (music-related interests)
      * For photographers: enable 'gallery', 'press' (exhibitions), 'skills' (photography tools), 'hobbies' (visual arts interests)
      * For developers: enable 'key_projects', 'skills', 'blog', 'status' (current work), 'resume'
      * For designers: enable 'gallery', 'key_projects', 'skills', 'blog', 'testimonials'
      * For writers: enable 'blog', 'press' (publications), 'key_projects', 'testimonials'
      * For educators: enable 'resume', 'skills', 'blog', 'testimonials', 'status'
      * Always enable 'hero', 'about', and 'contact' sections
      * Enable 'testimonials' for client-facing professions
      * Enable 'press' for public-facing work
      * Enable 'hobbies' for personal touch
    - For each section in "sections_config", generate an appropriate "title" that matches the user's profession and the section's purpose. For example:
      * "tracks" for a musician might be "My Compositions" or "Discography"
      * "gallery" for a photographer might be "Photo Portfolio" or "Visual Stories"
      * "press" might be "Press & Media" or "In the News"
      * "skills" might be "Skills & Tools" or "Expertise"
      * "hobbies" might be "Hobbies & Interests" or "What I Love"
    - Only output the raw JSON.
    `;
}

// Helper function to generate section titles specifically
function getSectionTitlesPrompt(prompt: string, templateName?: string) {
  let templateSpecificInstructions = "";
  
  if (templateName === 'Photo Gallery') {
    templateSpecificInstructions = `
    Template: Photo Gallery - This is a photography-focused portfolio template.
    Photography-specific section titles:
    - tracks: "Audio Stories", "Soundscapes", "Audio Work"
    - gallery: "Photo Portfolio", "My Photography", "Visual Stories"
    - press: "Exhibitions", "Publications", "Press Features"
    `;
  } else if (templateName === 'Music Maestro') {
    templateSpecificInstructions = `
    Template: Music Maestro - This is a music-focused portfolio template.
    Music-specific section titles:
    - tracks: "My Compositions", "Musical Works", "Discography"
    - gallery: "Performance Photos", "Behind the Scenes", "Studio Sessions"
    - press: "Press Coverage", "Reviews & Features", "Media Mentions"
    `;
  }

  return `
    You are a creative assistant that generates section titles for a portfolio website.
    Based on the user's prompt, generate appropriate titles for each portfolio section.

    User Prompt: "${prompt}"
    ${templateSpecificInstructions}

    Generate a JSON object with section titles that match the user's profession and style.
    Only include sections that would be relevant for the user's described profession.

    {
      "sections_config": {
        "about": { "title": "string" },
        "tracks": { "title": "string" },
        "gallery": { "title": "string" },
        "press": { "title": "string" },
        "contact": { "title": "string" },
        "skills": { "title": "string" },
        "hobbies": { "title": "string" },
        "resume": { "title": "string" },
        "testimonials": { "title": "string" },
        "blog": { "title": "string" },
        "status": { "title": "string" }
      }
    }

    Instructions:
    - Generate creative, professional section titles that match the user's profession
    - Use 2-4 words for each title
    - Make titles engaging and descriptive
    - Consider the template type when generating titles
    - Only output the raw JSON with relevant sections
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
    } else if (type === 'section_titles') {
      // Get template name from current portfolio if available
      const templateName = currentPortfolio?.theme_name || null;
      fullPrompt = getSectionTitlesPrompt(prompt, templateName);
    } else {
      // Get template name from current portfolio if available
      const templateName = currentPortfolio?.theme_name || null;
      fullPrompt = getPrompt(prompt, templateName);
    }
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    if (type === 'footer_about_summary') {
      // For footer about summary, return the text directly
      return NextResponse.json({ content: text.trim() });
    } else if (type === 'section_titles') {
      // For section titles only, parse and return the sections_config
      const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const generatedData = JSON.parse(jsonString);
      
      // Merge with existing sections_config, preserving enabled state and order
      const finalSectionsConfig = { ...currentPortfolio.sections_config };
      for (const key in generatedData.sections_config) {
        if (finalSectionsConfig[key]) {
          finalSectionsConfig[key] = {
            ...finalSectionsConfig[key],
            title: generatedData.sections_config[key].title
          };
        }
      }
      
      return NextResponse.json({ sections_config: finalSectionsConfig });
    } else {
      // For full portfolio generation (default), parse as JSON and include section titles
      const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const generatedData = JSON.parse(jsonString);

      // Smart section enabling logic: respect user's manual choices
      const finalSectionsConfig = { ...currentPortfolio.sections_config };
      for (const key in generatedData.sections_config) {
          if (finalSectionsConfig[key]) {
              const currentSection = finalSectionsConfig[key];
              const generatedSection = generatedData.sections_config[key];
              
              // Check if user has manually enabled this section (user_manually_enabled flag)
              const userManuallyEnabled = currentSection.user_manually_enabled === true;
              const userManuallyDisabled = currentSection.user_manually_disabled === true;
              
              // If user hasn't made a manual choice, use AI's suggestion
              if (!userManuallyEnabled && !userManuallyDisabled) {
                  finalSectionsConfig[key] = {
                    ...currentSection,
                    enabled: generatedSection.enabled,
                    title: generatedSection.title
                  };
              } else {
                  // If user has made a manual choice, preserve it and only update the title
                  finalSectionsConfig[key] = {
                    ...currentSection,
                    title: generatedSection.title
                  };
              }
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