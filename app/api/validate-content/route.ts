import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not found in environment variables');
      return NextResponse.json(
        { 
          error: 'AI validation service not configured',
          scaleFactor: 5,
          feedback: 'Content validation service unavailable. Please ensure your description is clear and appropriate.'
        },
        { status: 500 }
      );
    }

    const { content, context } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    console.log('Starting AI validation for content:', content);

    const prompt = `
You are a content validation expert for Hero Portfolio, a professional portfolio building platform. Your task is to evaluate the appropriateness of user-submitted portfolio descriptions by checking for unknown/made-up words.

EVALUATION CRITERIA:
1. **Appropriateness (1-10 scale)**:
   - 1: Complete gibberish, random characters, or too many unknown/made-up words
   - 2: Contains profanity, hate speech, violence, or some unknown words
   - 3-10: Meaningful content with mostly real words

2. **What to look for**:
   - Unknown or made-up words that don't exist in English
   - Random character strings or meaningless word combinations
   - Multiple inappropriate words (profanity, hate speech, violence)
   - Content that doesn't form coherent thoughts
   - Random typing or keyboard mashing

3. **Context**: This is for a portfolio description that will be used to generate a professional portfolio website.

CONTENT TO EVALUATE:
"${content}"

INSTRUCTIONS:
1. **Check for unknown/made-up words** - this is the PRIMARY focus
2. **Count how many unknown words are in the content**
3. **Give score 1 if:**
   - More than 50% of words are unknown/made-up
   - Complete gibberish (random characters, meaningless combinations)
   - Multiple inappropriate words (profanity, hate speech, violence)
   - Random typing or keyboard mashing
4. **Give score 2 if:**
   - 25-50% of words are unknown/made-up
   - Single inappropriate word or mild profanity
5. **Give score 3-5 if:**
   - 10-25% of words are unknown/made-up
   - Some typos or misspellings but mostly understandable
6. **Give score 6-10 if:**
   - Less than 10% unknown words
   - Mostly real, meaningful words
   - Clear, understandable content

EXAMPLES OF ACCEPTABLE CONTENT (score 6-10):
- "A jazz musician" (all real words)
- "Software developer with 5 years experience" (all real words)
- "Photographer specializing in portraits" (all real words)
- "Student studying computer science" (all real words)

EXAMPLES OF QUESTIONABLE CONTENT (score 3-5):
- "A jazz musisian with experiance" (some typos but understandable)
- "Softwear developr" (misspellings but clear meaning)

EXAMPLES OF UNACCEPTABLE CONTENT (score 1-2):
- "A jazz flibberjabber with zootzoot experience" (too many made-up words)
- "asdfghjkl" (random typing)
- "fuck shit damn" (multiple profanity)
- "random flibberjabber words that don't exist" (mostly made-up words)

RESPONSE FORMAT (JSON only):
{
  "scaleFactor": number (1-10),
  "feedback": "Brief feedback explaining the rating and unknown word count",
  "reason": "Brief reason for the rating (if applicable)",
  "suggestions": "Specific suggestions for improvement (if applicable)"
}

IMPORTANT: 
- **Focus on detecting unknown/made-up words**
- **Count the percentage of unknown words**
- **Be lenient with typos and misspellings**
- **Only reject content with too many unknown words**
- **Accept content with mostly real words**
- Return ONLY valid JSON, no additional text
`;

    console.log('Sending prompt to OpenAI...');
    let text: string;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      });
      
      text = completion.choices[0]?.message?.content || '';
      
      if (!text) {
        throw new Error('No response from OpenAI');
      }
    } catch (aiError) {
      console.error('OpenAI API Error:', aiError);
      throw aiError;
    }
    console.log('Raw AI response:', text);

    // Extract JSON from the response
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response:', text);
      throw new Error('Invalid JSON response from AI');
    }

    const validationResult = JSON.parse(jsonMatch[0]);
    console.log('Parsed validation result:', validationResult);

    // Validate the response structure
    if (typeof validationResult.scaleFactor !== 'number' || 
        validationResult.scaleFactor < 1 || 
        validationResult.scaleFactor > 10) {
      throw new Error('Invalid scale factor in AI response');
    }

    return NextResponse.json({
      scaleFactor: validationResult.scaleFactor,
      feedback: validationResult.feedback || 'Content evaluated',
      reason: validationResult.reason,
      suggestions: validationResult.suggestions
    });

  } catch (error) {
    console.error('Content validation error:', error);
    return NextResponse.json(
      { 
        error: 'Content validation failed',
        scaleFactor: 5,
        feedback: 'Unable to validate content. Please ensure your description is clear and appropriate.'
      },
      { status: 500 }
    );
  }
} 