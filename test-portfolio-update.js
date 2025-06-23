const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testPortfolioUpdate() {
  console.log('🧪 Testing portfolio update...');
  
  try {
    // First, let's see what portfolios exist
    const { data: portfolios, error: fetchError } = await supabase
      .from('user_portfolios')
      .select('id, name, hobbies_json, hobbies_title')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Error fetching portfolios:', fetchError);
      return;
    }
    
    if (portfolios.length === 0) {
      console.log('❌ No portfolios found');
      return;
    }
    
    const portfolio = portfolios[0];
    console.log('📊 Found portfolio:', portfolio.id, portfolio.name);
    console.log('Current hobbies_json:', portfolio.hobbies_json);
    console.log('Current hobbies_title:', portfolio.hobbies_title);
    
    // Try a simple update
    const testHobbies = [
      { name: 'Test Hobby', icon: '🎯' }
    ];
    
    console.log('\n🔄 Testing update...');
    const { data: updateData, error: updateError } = await supabase
      .from('user_portfolios')
      .update({ 
        hobbies_json: testHobbies,
        hobbies_title: 'Test Hobbies'
      })
      .eq('id', portfolio.id)
      .select();
    
    if (updateError) {
      console.error('❌ Update error:', updateError);
      console.error('Error details:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      });
    } else {
      console.log('✅ Update successful!');
      console.log('Updated data:', updateData);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testPortfolioUpdate(); 