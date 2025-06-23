const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testHobbies() {
  console.log('🧪 Testing hobbies functionality...');
  
  try {
    // Get the first portfolio
    const { data: portfolios, error } = await supabase
      .from('user_portfolios')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    if (portfolios.length === 0) {
      console.log('❌ No portfolios found');
      return;
    }
    
    const portfolio = portfolios[0];
    console.log('📊 Portfolio found:', portfolio.name);
    console.log('ID:', portfolio.id);
    console.log('Published:', portfolio.is_published);
    console.log('Hobbies Title:', portfolio.hobbies_title);
    console.log('Hobbies JSON:', portfolio.hobbies_json);
    console.log('Sections Config:', portfolio.sections_config);
    
    // Test updating hobbies
    const testHobbies = [
      { name: 'Music', icon: '🎵' },
      { name: 'Coding', icon: '💻' }
    ];
    
    console.log('\n🔄 Testing hobby update...');
    const { error: updateError } = await supabase
      .from('user_portfolios')
      .update({ 
        hobbies_json: testHobbies,
        hobbies_title: 'My Hobbies'
      })
      .eq('id', portfolio.id);
    
    if (updateError) {
      console.error('❌ Update error:', updateError);
    } else {
      console.log('✅ Hobbies updated successfully');
      
      // Verify the update
      const { data: updatedPortfolio, error: fetchError } = await supabase
        .from('user_portfolios')
        .select('hobbies_json, hobbies_title')
        .eq('id', portfolio.id)
        .single();
      
      if (fetchError) {
        console.error('❌ Fetch error:', fetchError);
      } else {
        console.log('✅ Verified update:');
        console.log('Hobbies Title:', updatedPortfolio.hobbies_title);
        console.log('Hobbies JSON:', updatedPortfolio.hobbies_json);
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testHobbies(); 