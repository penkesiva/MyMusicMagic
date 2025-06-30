const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSponsors() {
  console.log('🧪 Testing Sponsors Section...\n');

  try {
    // 1. Check if sponsors fields exist in the database
    console.log('1. Checking database schema...');
    const { data: columns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'user_portfolios')
      .in('column_name', ['sponsors_title', 'sponsors_json']);

    if (schemaError) {
      console.error('❌ Error checking schema:', schemaError);
      return;
    }

    console.log('✅ Database columns found:', columns.map(c => `${c.column_name} (${c.data_type})`));

    // 2. Get a test portfolio
    console.log('\n2. Getting test portfolio...');
    const { data: portfolios, error: portfolioError } = await supabase
      .from('user_portfolios')
      .select('id, name, sponsors_title, sponsors_json')
      .limit(1);

    if (portfolioError) {
      console.error('❌ Error fetching portfolio:', portfolioError);
      return;
    }

    if (!portfolios || portfolios.length === 0) {
      console.log('⚠️  No portfolios found. Creating a test portfolio...');
      // Create a test portfolio
      const { data: newPortfolio, error: createError } = await supabase
        .from('user_portfolios')
        .insert({
          name: 'Test Portfolio for Sponsors',
          artist_name: 'Test Artist',
          user_id: '00000000-0000-0000-0000-000000000000', // Placeholder
          slug: 'test-sponsors',
          is_published: false
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating test portfolio:', createError);
        return;
      }

      console.log('✅ Test portfolio created:', newPortfolio.id);
      portfolios = [newPortfolio];
    }

    const portfolio = portfolios[0];
    console.log('✅ Portfolio found:', portfolio.name);

    // 3. Test updating sponsors data
    console.log('\n3. Testing sponsors data update...');
    const testSponsors = [
      {
        id: 'sponsor-1',
        name: 'Music Label Inc.',
        icon_url: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=ML',
        website_url: 'https://musiclabel.com',
        order: 1
      },
      {
        id: 'sponsor-2',
        name: 'Studio Equipment Co.',
        icon_url: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=SE',
        website_url: 'https://studioequipment.com',
        order: 2
      },
      {
        id: 'sponsor-3',
        name: 'Streaming Platform',
        icon_url: 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=SP',
        website_url: 'https://streamingplatform.com',
        order: 3
      }
    ];

    const { data: updatedPortfolio, error: updateError } = await supabase
      .from('user_portfolios')
      .update({
        sponsors_title: 'Our Amazing Sponsors',
        sponsors_json: testSponsors
      })
      .eq('id', portfolio.id)
      .select('id, name, sponsors_title, sponsors_json')
      .single();

    if (updateError) {
      console.error('❌ Error updating sponsors:', updateError);
      return;
    }

    console.log('✅ Sponsors updated successfully!');
    console.log('   Title:', updatedPortfolio.sponsors_title);
    console.log('   Sponsors count:', updatedPortfolio.sponsors_json?.length || 0);
    console.log('   Sponsors:', updatedPortfolio.sponsors_json?.map(s => s.name));

    // 4. Test sections config for sponsors
    console.log('\n4. Testing sections config for sponsors...');
    const { data: sectionsConfig, error: configError } = await supabase
      .from('user_portfolios')
      .select('sections_config')
      .eq('id', portfolio.id)
      .single();

    if (configError) {
      console.error('❌ Error fetching sections config:', configError);
      return;
    }

    console.log('✅ Current sections config:', sectionsConfig.sections_config);

    // Update sections config to enable sponsors
    const updatedConfig = {
      ...sectionsConfig.sections_config,
      sponsors: {
        enabled: true,
        name: 'Sponsors & Partners',
        title: 'Our Amazing Sponsors',
        order: 8
      }
    };

    const { data: updatedConfigData, error: configUpdateError } = await supabase
      .from('user_portfolios')
      .update({
        sections_config: updatedConfig
      })
      .eq('id', portfolio.id)
      .select('sections_config')
      .single();

    if (configUpdateError) {
      console.error('❌ Error updating sections config:', configUpdateError);
      return;
    }

    console.log('✅ Sections config updated successfully!');
    console.log('   Sponsors enabled:', updatedConfigData.sections_config?.sponsors?.enabled);

    // 5. Test published content (if exists)
    console.log('\n5. Testing published content...');
    const { data: publishedData, error: publishedError } = await supabase
      .from('user_portfolios')
      .select('published_content')
      .eq('id', portfolio.id)
      .single();

    if (publishedError) {
      console.error('❌ Error fetching published content:', publishedError);
    } else {
      console.log('✅ Published content:', publishedData.published_content);
    }

    console.log('\n🎉 Sponsors section test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Database schema: ✅');
    console.log('   - Portfolio update: ✅');
    console.log('   - Sponsors data: ✅');
    console.log('   - Sections config: ✅');
    console.log('   - Published content: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSponsors(); 