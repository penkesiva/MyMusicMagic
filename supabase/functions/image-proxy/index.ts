import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, portfolioId } = await req.json()

    if (!url || !portfolioId) {
      throw new Error('Missing url or portfolioId parameter')
    }
    
    // Fetch the image from the provided URL
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const blob = await response.blob()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const fileExt = contentType.split('/')[1]
    
    // We need to create a Supabase client with service_role privileges
    // to bypass RLS policies for server-side operations.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
    const filePath = `portfolios/${portfolioId}/gallery/${fileName}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('gallery-images')
      .upload(filePath, blob, { contentType })

    if (uploadError) {
      throw uploadError
    }
    
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('gallery-images')
      .getPublicUrl(filePath)

    return new Response(JSON.stringify({ publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 