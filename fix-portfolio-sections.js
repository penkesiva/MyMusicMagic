const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPortfolioSections() {
  try {
    console.log('🔧 Fixing portfolio sections...');
    
    // 1. Enable resume section
    console.log('\n📄 Enabling resume section...');
    const { data: portfolio, error: portfolioError } = await supabase
      .from('user_portfolios')
      .select('id, name, slug, sections_config')
      .eq('slug', 'mm1')
      .single();
    
    if (portfolioError) {
      console.error('❌ Error fetching portfolio:', portfolioError);
      return;
    }
    
    console.log('✅ Found portfolio:', portfolio.name);
    console.log('📊 Current sections config:', portfolio.sections_config);
    
    // Update sections config to enable resume
    const updatedSectionsConfig = {
      ...portfolio.sections_config,
      resume: {
        enabled: true,
        name: 'Resume',
        order: 9
      }
    };
    
    const { error: updateError } = await supabase
      .from('user_portfolios')
      .update({ sections_config: updatedSectionsConfig })
      .eq('id', portfolio.id);
    
    if (updateError) {
      console.error('❌ Error updating sections config:', updateError);
      return;
    }
    
    console.log('✅ Resume section enabled!');
    
    // 2. Add sample gallery items
    console.log('\n🖼️ Adding sample gallery items...');
    
    const sampleGalleryItems = [
      {
        portfolio_id: portfolio.id,
        title: 'Studio Session',
        description: 'Recording in the studio',
        image_url: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&h=600&fit=crop',
        type: 'photo',
        order: 1
      },
      {
        portfolio_id: portfolio.id,
        title: 'Live Performance',
        description: 'On stage performing live',
        image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
        type: 'photo',
        order: 2
      },
      {
        portfolio_id: portfolio.id,
        title: 'Music Production',
        description: 'Working on new tracks',
        image_url: 'https://images.unsplash.com/photo-1598387993448-9440c6d3227c?w=800&h=600&fit=crop',
        type: 'photo',
        order: 3
      }
    ];
    
    const { data: galleryItems, error: galleryError } = await supabase
      .from('gallery')
      .insert(sampleGalleryItems)
      .select();
    
    if (galleryError) {
      console.error('❌ Error adding gallery items:', galleryError);
      return;
    }
    
    console.log('✅ Added', galleryItems.length, 'gallery items!');
    
    // 3. Verify the changes
    console.log('\n🔍 Verifying changes...');
    
    const { data: updatedPortfolio, error: verifyError } = await supabase
      .from('user_portfolios')
      .select('id, name, slug, sections_config')
      .eq('slug', 'mm1')
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying portfolio:', verifyError);
      return;
    }
    
    console.log('📊 Updated sections config:', updatedPortfolio.sections_config);
    
    const { data: galleryCount, error: countError } = await supabase
      .from('gallery')
      .select('id', { count: 'exact' })
      .eq('portfolio_id', portfolio.id);
    
    if (countError) {
      console.error('❌ Error counting gallery items:', countError);
      return;
    }
    
    console.log('🖼️ Gallery items count:', galleryCount.length);
    
    console.log('\n🎉 Portfolio sections fixed successfully!');
    console.log('📍 Visit: http://localhost:3000/portfolio/penkesiva/mm1');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixPortfolioSections(); 