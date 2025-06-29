// Script to update existing tracks with empty thumbnail URLs to use the default thumbnail
// Run this script to fix existing tracks in the database

const { createClient } = require('@supabase/supabase-js')

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Function to get random default thumbnail (same as in utils.ts)
function getRandomDefaultTrackThumbnail() {
  const defaultThumbnails = [
    '/default-track-thumbnail-1.jpg',
    '/default-track-thumbnail-2.jpg', 
    '/default-track-thumbnail-3.jpg',
    '/default-track-thumbnail-4.jpg',
    '/default-track-thumbnail-5.jpg',
    '/default-track-thumbnail-6.jpg',
    '/default-track-thumbnail-7.jpg',
    '/default-track-thumbnail-8.jpg',
    '/default-track-thumbnail-9.jpg',
    '/default-track-thumbnail-10.jpg'
  ]
  
  // Randomly select one of the default thumbnails
  const randomIndex = Math.floor(Math.random() * defaultThumbnails.length)
  return defaultThumbnails[randomIndex]
}

async function updateExistingTracks() {
  try {
    console.log('🔍 Finding tracks with empty thumbnail URLs...')
    
    // Find tracks with empty or null thumbnail_url
    const { data: tracks, error } = await supabase
      .from('tracks')
      .select('id, title, thumbnail_url')
      .or('thumbnail_url.is.null,thumbnail_url.eq.')
    
    if (error) {
      console.error('Error fetching tracks:', error)
      return
    }
    
    console.log(`📊 Found ${tracks.length} tracks with empty thumbnail URLs`)
    
    if (tracks.length === 0) {
      console.log('✅ No tracks need updating!')
      return
    }
    
    // Update each track to use the default thumbnail
    const updates = tracks.map(track => ({
      id: track.id,
      thumbnail_url: getRandomDefaultTrackThumbnail()
    }))
    
    console.log('🔄 Updating tracks with random default thumbnails...')
    
    const { error: updateError } = await supabase
      .from('tracks')
      .upsert(updates, { onConflict: 'id' })
    
    if (updateError) {
      console.error('Error updating tracks:', updateError)
      return
    }
    
    console.log('✅ Successfully updated all tracks!')
    console.log('📝 Updated tracks:')
    tracks.forEach(track => {
      const update = updates.find(u => u.id === track.id)
      console.log(`  - ${track.title} (ID: ${track.id}) → ${update.thumbnail_url}`)
    })
    
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

updateExistingTracks() 