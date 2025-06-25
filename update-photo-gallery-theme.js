const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function updatePhotoGalleryTheme() {
  console.log('📸 Updating Photo Gallery Portfolio Theme...');
  
  try {
    // 1. Find the Photo Gallery template
    console.log('\n1. Finding Photo Gallery template...');
    const { data: templates, error: templateError } = await supabase
      .from('portfolio_templates')
      .select('*')
      .eq('name', 'Photo Gallery');
    
    if (templateError || templates.length === 0) {
      console.error('❌ Error finding Photo Gallery template:', templateError);
      return;
    }
    
    const photoGalleryTemplate = templates[0];
    console.log('✅ Photo Gallery template found:', photoGalleryTemplate.id);

    // 2. Find portfolios using Photo Gallery template
    console.log('\n2. Finding portfolios with Photo Gallery template...');
    const { data: portfolios, error: portfolioError } = await supabase
      .from('user_portfolios')
      .select('id, name, theme_name, sections_config')
      .eq('template_id', photoGalleryTemplate.id);
    
    if (portfolioError) {
      console.error('❌ Error fetching portfolios:', portfolioError);
      return;
    }
    
    console.log('✅ Found portfolios with Photo Gallery template:', portfolios.length);
    
    // 3. Update each portfolio to use Photo Gallery theme
    for (const portfolio of portfolios) {
      console.log(`\n3. Updating portfolio: ${portfolio.name}`);
      console.log(`   Current theme: ${portfolio.theme_name}`);
      
      if (portfolio.theme_name !== 'Photo Gallery') {
        const { error: updateError } = await supabase
          .from('user_portfolios')
          .update({ 
            theme_name: 'Photo Gallery',
            sections_config: {
              hero: { enabled: true, name: 'Welcome', order: 1 },
              about: { enabled: true, name: 'About My Photography', order: 2 },
              gallery: { enabled: true, name: 'Portfolio', order: 3 },
              skills: { enabled: true, name: 'Photography Skills', order: 4 },
              hobbies: { enabled: true, name: 'Photography Interests', order: 5 },
              contact: { enabled: true, name: 'Get In Touch', order: 6 },
              footer: { enabled: true, name: 'Footer', order: 7 }
            }
          })
          .eq('id', portfolio.id);
        
        if (updateError) {
          console.error(`❌ Error updating portfolio ${portfolio.name}:`, updateError);
        } else {
          console.log(`✅ Successfully updated portfolio ${portfolio.name} to Photo Gallery theme`);
        }
      } else {
        console.log(`   Portfolio ${portfolio.name} already has correct theme`);
      }
    }

    // 4. Verify the updates
    console.log('\n4. Verifying updates...');
    const { data: updatedPortfolios, error: verifyError } = await supabase
      .from('user_portfolios')
      .select('id, name, theme_name')
      .eq('template_id', photoGalleryTemplate.id);
    
    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    } else {
      console.log('✅ Updated portfolios:');
      updatedPortfolios.forEach(portfolio => {
        console.log(`   - ${portfolio.name}: ${portfolio.theme_name}`);
      });
    }

    console.log('\n🎉 Photo Gallery Theme Update Complete!');
    console.log('\n📋 Summary:');
    console.log(`✅ Updated ${portfolios.length} portfolios to use Photo Gallery theme`);
    console.log('✅ Photo Gallery theme is now properly configured');
    console.log('✅ Sections are configured for photography focus');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Preview the updated portfolios to see the new Photo Gallery styling');
    console.log('2. Test the AI generation with photography-specific content');
    console.log('3. Add photography-specific content to showcase the template');

  } catch (error) {
    console.error('❌ Update error:', error);
  }
}

updatePhotoGalleryTheme(); 