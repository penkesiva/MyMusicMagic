const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCurvedSeparators() {
  console.log('🎨 Testing Curved Separators Blending Style...\n');

  try {
    // Get a test portfolio
    const { data: portfolios, error } = await supabase
      .from('user_portfolios')
      .select('*')
      .limit(1);

    if (error || !portfolios || portfolios.length === 0) {
      console.error('❌ No portfolios found:', error);
      return;
    }

    const portfolio = portfolios[0];
    console.log('📋 Found portfolio:', portfolio.name);

    // Update the portfolio to use curved separators style
    const { data: updatedPortfolio, error: updateError } = await supabase
      .from('user_portfolios')
      .update({ section_blending_style: 'curved-separators' })
      .eq('id', portfolio.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update portfolio:', updateError);
      return;
    }

    console.log('✅ Successfully updated portfolio to use curved separators style');
    console.log('🎯 Portfolio ID:', updatedPortfolio.id);
    console.log('🎨 Blending Style:', updatedPortfolio.section_blending_style);
    
    // Test the preview URL
    const previewUrl = `http://localhost:3000/portfolio/preview/${updatedPortfolio.id}`;
    console.log('\n🌐 Preview URL:', previewUrl);
    console.log('📱 Open this URL in your browser to see the curved separators in action!');
    
    // Test the live URL (if published)
    if (updatedPortfolio.is_published) {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('id', updatedPortfolio.user_id)
        .single();
      
      if (userProfile) {
        const liveUrl = `http://localhost:3000/portfolio/${userProfile.username}/${updatedPortfolio.slug}`;
        console.log('🌍 Live URL:', liveUrl);
      }
    }

    console.log('\n🎨 Curved Separators Features:');
    console.log('   • Beautiful curved wave separators between sections');
    console.log('   • Multiple color variations (blue, pink, cyan, green)');
    console.log('   • Decorative circular elements');
    console.log('   • Responsive design for mobile devices');
    console.log('   • SVG-based waves for crisp rendering');

  } catch (err) {
    console.error('❌ Error testing curved separators:', err);
  }
}

// Run the test
testCurvedSeparators(); 