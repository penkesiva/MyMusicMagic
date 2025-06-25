const { createClient } = require('@supabase/supabase-js');

// Use the same configuration as your app
const supabaseUrl = 'https://aadmkdnnymlokuhlhzfg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZG1rZG5ueW1sb2t1aGxoemZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzQsImV4cCI6MjA1MDU0ODk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugGallery() {
  try {
    console.log('🔍 Debugging Gallery Table...\n');
    
    // 1. Get the portfolio ID for 'mm1'
    console.log('📋 Step 1: Finding portfolio...');
    const { data: portfolio, error: portfolioError } = await supabase
      .from('user_portfolios')
      .select('id, name, slug')
      .eq('slug', 'mm1')
      .single();
    
    if (portfolioError) {
      console.error('❌ Error finding portfolio:', portfolioError);
      return;
    }
    
    console.log('✅ Found portfolio:', portfolio);
    
    // 2. Check gallery table structure
    console.log('\n📊 Step 2: Checking gallery table structure...');
    const { data: galleryStructure, error: structureError } = await supabase
      .from('gallery')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Error checking gallery structure:', structureError);
      return;
    }
    
    console.log('✅ Gallery table structure (sample row):', galleryStructure[0] || 'No rows found');
    
    // 3. Check all gallery items for this portfolio
    console.log('\n🖼️ Step 3: Checking gallery items for portfolio...');
    const { data: galleryItems, error: galleryError } = await supabase
      .from('gallery')
      .select('*')
      .eq('portfolio_id', portfolio.id);
    
    if (galleryError) {
      console.error('❌ Error fetching gallery items:', galleryError);
      return;
    }
    
    console.log('✅ Gallery items found:', galleryItems.length);
    console.log('📋 Gallery items:', galleryItems);
    
    // 4. Check if there are any gallery items at all
    console.log('\n🔍 Step 4: Checking all gallery items...');
    const { data: allGalleryItems, error: allError } = await supabase
      .from('gallery')
      .select('*');
    
    if (allError) {
      console.error('❌ Error fetching all gallery items:', allError);
      return;
    }
    
    console.log('✅ Total gallery items in database:', allGalleryItems.length);
    if (allGalleryItems.length > 0) {
      console.log('📋 Sample gallery items:', allGalleryItems.slice(0, 3));
    }
    
    // 5. Check portfolio query that's used in the page
    console.log('\n🌐 Step 5: Simulating the portfolio page query...');
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('id, username, full_name')
      .eq('username', 'penkesiva')
      .single();
    
    if (userError) {
      console.error('❌ Error finding user profile:', userError);
      return;
    }
    
    console.log('✅ Found user profile:', userProfile);
    
    const { data: portfolioPage, error: portfolioPageError } = await supabase
      .from('user_portfolios')
      .select('*')
      .eq('user_id', userProfile.id)
      .eq('slug', 'mm1')
      .eq('is_published', true)
      .single();
    
    if (portfolioPageError) {
      console.error('❌ Error finding portfolio for page:', portfolioPageError);
      return;
    }
    
    console.log('✅ Found portfolio for page:', portfolioPage.id);
    
    const { data: galleryItemsPage, error: galleryPageError } = await supabase
      .from('gallery')
      .select('*')
      .eq('portfolio_id', portfolioPage.id)
      .order('created_at', { ascending: true });
    
    if (galleryPageError) {
      console.error('❌ Error fetching gallery items for page:', galleryPageError);
      return;
    }
    
    console.log('✅ Gallery items for page:', galleryItemsPage.length);
    console.log('📋 Gallery items for page:', galleryItemsPage);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugGallery(); 