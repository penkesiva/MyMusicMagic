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
    Focus on photography skills, techniques, and visual storytelling.
    `;
  } else if (templateName === 'Music Maestro') {
    templateSpecificInstructions = `
    Template: Music Maestro - This is a music-focused portfolio template.
    Focus on musical skills, instruments, and performance.
    `;
  }

  return `
    You are a creative assistant that generates content for a personal portfolio website. 
    Based on the user's prompt, generate a JSON object that can be used to populate the portfolio.

    User Prompt: "${prompt}"
    ${templateSpecificInstructions}

    Generate a JSON object with the following structure. Do NOT include any markdown or explanatory text around the JSON object.

    {
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
        "hero": { "enabled": true, "title": "Welcome" },
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

    Available sections and their purposes:
    - hero: Welcome section (always enabled)
    - about: Personal introduction and background (always enabled)
    - tracks: Music tracks, compositions, or audio work
    - gallery: Photo gallery, visual portfolio, or work samples
    - key_projects: Featured projects, case studies, or major achievements
    - testimonials: Client feedback, reviews, or recommendations
    - press: Media coverage, publications, or press mentions
    - blog: Articles, thoughts, or writing samples
    - status: Current work, what you're working on, or status updates
    - skills: Technical skills, tools, or expertise
    - resume: Professional experience, education, or CV
    - hobbies: Personal interests, passions, or activities
    - contact: Contact information and ways to get in touch (always enabled)

    Instructions:
    - Generate creative content directly inspired by the user's prompt
    - For skills_json, include 3-5 relevant technical or professional skills with hex color codes
    - For hobbies_json, include 3-5 relevant hobbies or interests with emojis
    - For sections_config, intelligently enable sections that make sense for the user's profession
    - For developers: enable key_projects, skills, blog, status, resume
    - For designers: enable gallery, key_projects, skills, testimonials
    - For musicians: enable tracks, gallery, press, skills, hobbies
    - For photographers: enable gallery, press, skills, hobbies
    - For writers: enable blog, press, key_projects, testimonials
    - For educators: enable resume, skills, blog, testimonials, status
    - Always enable hero, about, and contact sections
    - Generate appropriate titles for each enabled section
    - Only output the raw JSON
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
  try {
    const body = await request.json();
    const { prompt, currentPortfolio, type, about_text, artist_name } = body;

    console.log('API Request received:', { 
      hasPrompt: !!prompt, 
      hasType: !!type, 
      hasCurrentPortfolio: !!currentPortfolio,
      promptLength: prompt?.length,
      type: type
    });

    if (!prompt && !type) {
      console.log('Validation error: Missing prompt and type');
      return NextResponse.json({ error: 'Prompt or type is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log('Configuration error: Missing GEMINI_API_KEY');
      return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
    }

    // Validate currentPortfolio for full generation
    if (!type && !currentPortfolio) {
      console.log('Validation error: Missing currentPortfolio for full generation');
      return NextResponse.json({ error: 'Current portfolio data is required for AI generation.' }, { status: 400 });
    }

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

    console.log('Sending request to Gemini API with prompt length:', fullPrompt.length);
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    console.log('Received response from Gemini API, length:', text.length);

    if (type === 'footer_about_summary') {
      // For footer about summary, return the text directly
      return NextResponse.json({ content: text.trim() });
    } else if (type === 'section_titles') {
      // For section titles only, parse and return the sections_config
      try {
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        console.log('AI Response for section titles:', jsonString);
        const generatedData = JSON.parse(jsonString);
        
        // Merge with existing sections_config, preserving enabled state and order
        const finalSectionsConfig = { ...(currentPortfolio?.sections_config || {}) };
        for (const key in generatedData.sections_config) {
          if (finalSectionsConfig[key]) {
            finalSectionsConfig[key] = {
              ...finalSectionsConfig[key],
              title: generatedData.sections_config[key].title
            };
          }
        }
        
        return NextResponse.json({ sections_config: finalSectionsConfig });
      } catch (parseError) {
        console.error('JSON parsing error for section titles:', parseError);
        console.error('Raw AI response:', text);
        return NextResponse.json({ error: 'Invalid JSON response from AI.' }, { status: 500 });
      }
    } else {
      // For full portfolio generation (default), parse as JSON and include section titles
      try {
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        console.log('AI Response for full generation:', jsonString);
        const generatedData = JSON.parse(jsonString);

        // Smart section enabling logic: respect user's manual choices
        const finalSectionsConfig = { ...(currentPortfolio?.sections_config || {}) };
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

        // Preserve the existing portfolio name - don't let AI change it
        const finalData = {
          ...generatedData,
          name: currentPortfolio?.name || 'Untitled Portfolio' // Keep the user's original portfolio name
        };

        // Also update individual section title fields based on sections_config titles
        const updatedData = { ...finalData };
        if (finalData.sections_config) {
          // Update individual section title fields
          if (finalData.sections_config.about?.title) {
            updatedData.about_title = finalData.sections_config.about.title;
          }
          if (finalData.sections_config.tracks?.title) {
            updatedData.tracks_title = finalData.sections_config.tracks.title;
          }
          if (finalData.sections_config.gallery?.title) {
            updatedData.gallery_title = finalData.sections_config.gallery.title;
          }
          if (finalData.sections_config.press?.title) {
            updatedData.press_title = finalData.sections_config.press.title;
          }
          if (finalData.sections_config.key_projects?.title) {
            updatedData.key_projects_title = finalData.sections_config.key_projects.title;
          }
          if (finalData.sections_config.testimonials?.title) {
            updatedData.testimonials_title = finalData.sections_config.testimonials.title;
          }
          if (finalData.sections_config.blog?.title) {
            updatedData.blog_title = finalData.sections_config.blog.title;
          }
          if (finalData.sections_config.status?.title) {
            updatedData.status_title = finalData.sections_config.status.title;
          }
          if (finalData.sections_config.skills?.title) {
            updatedData.skills_title = finalData.sections_config.skills.title;
          }
          if (finalData.sections_config.resume?.title) {
            updatedData.resume_title = finalData.sections_config.resume.title;
          }
          if (finalData.sections_config.hobbies?.title) {
            updatedData.hobbies_title = finalData.sections_config.hobbies.title;
          }
          if (finalData.sections_config.contact?.title) {
            updatedData.contact_title = finalData.sections_config.contact.title;
          }
        }

        console.log('Successfully generated portfolio data');
        return NextResponse.json(updatedData);
      } catch (parseError) {
        console.error('JSON parsing error for full generation:', parseError);
        console.error('Raw AI response:', text);
        return NextResponse.json({ error: 'Invalid JSON response from AI.' }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('Error in generate-portfolio API:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    });
    
    // Check if it's a JSON parsing error from the request
    if (error instanceof SyntaxError) {
      console.error('JSON parsing error in request body');
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    
    // Check if it's a Gemini API error
    if ((error as Error).message?.includes('API_KEY')) {
      console.error('Gemini API key error');
      return NextResponse.json({ error: 'Invalid or missing Gemini API key.' }, { status: 500 });
    }
    
    // Check for Gemini API overload (503) or other service issues
    if ((error as Error).message?.includes('503') || (error as Error).message?.includes('overloaded')) {
      console.error('Gemini API overload error');
      return NextResponse.json({ 
        error: 'The AI service is currently overloaded. Please try again in a few moments.' 
      }, { status: 503 });
    }
    
    // Check for rate limiting or quota exceeded
    if ((error as Error).message?.includes('429') || (error as Error).message?.includes('quota')) {
      console.error('Gemini API rate limit/quota error');
      return NextResponse.json({ 
        error: 'AI service rate limit exceeded. Please try again later.' 
      }, { status: 429 });
    }
    
    // Check for network or connection issues
    if ((error as Error).message?.includes('fetch') || (error as Error).message?.includes('network')) {
      console.error('Network error');
      return NextResponse.json({ 
        error: 'Network error connecting to AI service. Please check your connection and try again.' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Failed to generate content from AI.' }, { status: 500 });
  }
} 