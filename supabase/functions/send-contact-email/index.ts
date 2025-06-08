// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// @ts-ignore
import { Resend } from 'https://esm.sh/resend@2.0.0'

// Add Deno types
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response>): void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { email, message } = await req.json() as { email: string; message: string }
    console.log('Received contact form submission:', { email, message })

    // Get environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const contactEmail = Deno.env.get('CONTACT_EMAIL')
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured')
    }
    if (!contactEmail) {
      throw new Error('CONTACT_EMAIL is not configured')
    }

    console.log('Environment variables loaded:', { 
      hasApiKey: !!resendApiKey, 
      contactEmail 
    })

    // Initialize Resend with your API key
    const resend = new Resend(resendApiKey)

    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'My Music Magic <onboarding@resend.dev>', // Use Resend's default sender
      to: contactEmail,
      subject: 'New Contact Form Message',
      html: `
        <h2>New Contact Form Message</h2>
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    })

    if (error) {
      console.error('Resend API error:', error)
      throw error
    }

    console.log('Email sent successfully:', data)

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: unknown) {
    console.error('Error in send-contact-email function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorDetails = error instanceof Error ? error.stack : 'No stack trace'
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 