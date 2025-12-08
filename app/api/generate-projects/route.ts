import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  project_url: string;
  technologies: string[];
  year: string;
}

function getProjectsPrompt(userPrompt: string) {
  return `
    You are a creative assistant that generates realistic project examples for a portfolio website.
    Based on the user's prompt, generate 2 detailed projects that would be relevant to their background and skills.

    User Prompt: "${userPrompt}"

    Generate a JSON array with exactly 2 projects. Each project should have realistic details and be relevant to the user's background.
    
    Return ONLY the JSON array, no other text or markdown formatting.

    [
      {
        "id": "unique-id-1",
        "title": "A realistic project title based on the user's background",
        "description": "A detailed 2-3 sentence description of the project, what it does, and the user's role. Make it sound professional and impressive.",
        "image_url": "https://images.unsplash.com/photo-[relevant-image-id]?w=400&h=300&fit=crop",
        "project_url": "https://github.com/[username]/[project-name]",
        "technologies": ["Technology 1", "Technology 2", "Technology 3"],
        "year": "2024"
      },
      {
        "id": "unique-id-2", 
        "title": "Another realistic project title",
        "description": "Another detailed 2-3 sentence description of a different project that showcases different skills.",
        "image_url": "https://images.unsplash.com/photo-[different-image-id]?w=400&h=300&fit=crop",
        "project_url": "https://github.com/[username]/[different-project]",
        "technologies": ["Technology 4", "Technology 5", "Technology 6"],
        "year": "2023"
      }
    ]

    Guidelines:
    - Make projects realistic and relevant to the user's background
    - Use real GitHub URLs (you can use popular open source projects as examples)
    - Use real Unsplash image URLs for project images
    - Include 3-4 relevant technologies per project
    - Make descriptions professional and impressive
    - Ensure projects showcase different skills and technologies
    - Use recent years (2023-2024)
    - Make sure the projects are diverse (different types of projects)
  `;
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    console.log('Generating projects for prompt:', prompt);

    const aiPrompt = getProjectsPrompt(prompt);
    
    console.log('Sending request to OpenAI...');
    let text;
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        temperature: 0.7,
      });
      
      text = completion.choices[0]?.message?.content || '';
      
      if (!text) {
        throw new Error('No response from OpenAI');
      }
    } catch (aiError: unknown) {
      console.error('OpenAI Error:', aiError);
      const errorString = aiError instanceof Error ? aiError.message : String(aiError);
      if (errorString.includes('429') || errorString.includes('rate_limit')) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (errorString.includes('404') || errorString.includes('model_not_found')) {
        throw new Error('AI model not found. Please check API configuration.');
      } else if (errorString.includes('401') || errorString.includes('403') || errorString.includes('invalid_api_key')) {
        throw new Error('Invalid API key. Please check your OpenAI API configuration.');
      } else {
        throw new Error(`AI service error: ${errorString}`);
      }
    }

    console.log('Raw AI response:', text);

    // Clean up the response - remove any markdown formatting
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/, '').replace(/```\n?/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/, '').replace(/```\n?/, '');
    }

    console.log('Cleaned text:', cleanText);

    // Parse the JSON response
    let projects: Project[];
    try {
      projects = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Text that failed to parse:', cleanText);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate the response structure
    if (!Array.isArray(projects)) {
      throw new Error('AI response is not an array');
    }

    if (projects.length !== 2) {
      console.warn(`Expected 2 projects, got ${projects.length}`);
    }

    // Ensure each project has the required fields
    const validatedProjects = projects.map((project, index) => ({
      id: project.id || `project-${Date.now()}-${index}`,
      title: project.title || `Project ${index + 1}`,
      description: project.description || 'Project description',
      image_url: project.image_url || 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop',
      project_url: project.project_url || 'https://github.com/example/project',
      technologies: Array.isArray(project.technologies) ? project.technologies : ['Technology'],
      year: project.year || '2024'
    }));

    console.log('Validated projects:', validatedProjects);

    return NextResponse.json({ projects: validatedProjects });

  } catch (error) {
    console.error('Error generating projects:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate projects: ${errorMessage}` },
      { status: 500 }
    );
  }
} 