const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugHobbies() {
  console.log('🔍 Debugging hobbies data...');
  
  try {
    // Get all portfolios
    const { data: portfolios, error } = await supabase
      .from('user_portfolios')
      .select('id, name, hobbies_json, hobbies_title, sections_config')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching portfolios:', error);
      return;
    }
    
    console.log('📊 Found portfolios:', portfolios.length);
    
    portfolios.forEach((portfolio, index) => {
      console.log(`\n--- Portfolio ${index + 1}: ${portfolio.name} ---`);
      console.log('ID:', portfolio.id);
      console.log('Hobbies Title:', portfolio.hobbies_title);
      console.log('Hobbies JSON:', JSON.stringify(portfolio.hobbies_json, null, 2));
      console.log('Sections Config:', JSON.stringify(portfolio.sections_config, null, 2));
      
      // Check if hobbies section is enabled
      const hobbiesEnabled = portfolio.sections_config?.hobbies?.enabled;
      console.log('Hobbies Section Enabled:', hobbiesEnabled);
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugHobbies(); 