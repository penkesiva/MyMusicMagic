const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  console.log('🔍 Checking database schema...');
  
  try {
    // Try to get the table structure by querying a single row
    const { data, error } = await supabase
      .from('user_portfolios')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error querying table:', error);
      return;
    }
    
    if (data && data.length > 0) {
      const row = data[0];
      console.log('📊 Table columns found:');
      Object.keys(row).forEach(key => {
        console.log(`  - ${key}: ${typeof row[key]} (${row[key] === null ? 'null' : 'value'})`);
      });
      
      // Check specific columns we're trying to update
      console.log('\n🎯 Checking specific columns:');
      console.log('hobbies_json:', typeof row.hobbies_json, row.hobbies_json);
      console.log('skills_json:', typeof row.skills_json, row.skills_json);
      console.log('sections_config:', typeof row.sections_config, row.sections_config);
    } else {
      console.log('❌ No data found in table');
    }
    
  } catch (error) {
    console.error('❌ Schema check error:', error);
  }
}

checkSchema(); 