const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function runThemeMigration() {
  console.log('🔧 Running theme_name column migration...');
  
  try {
    // Check if theme_name column exists
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'user_portfolios' });
    
    if (columnError) {
      console.log('⚠️ Could not check columns, trying direct migration...');
    } else {
      const hasThemeName = columns?.some(col => col.column_name === 'theme_name');
      if (hasThemeName) {
        console.log('✅ theme_name column already exists');
        return;
      }
    }

    // Try to add the column using a simple query
    console.log('📝 Adding theme_name column...');
    const { error: migrationError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          ALTER TABLE public.user_portfolios 
          ADD COLUMN IF NOT EXISTS theme_name TEXT DEFAULT 'Midnight Dusk';
        `
      });
    
    if (migrationError) {
      console.log('⚠️ RPC method not available, trying alternative approach...');
      
      // Alternative: Try to update an existing portfolio with theme_name
      const { data: portfolios, error: fetchError } = await supabase
        .from('user_portfolios')
        .select('id')
        .limit(1);
      
      if (fetchError) {
        console.error('❌ Error fetching portfolios:', fetchError);
        console.log('\n💡 Manual Migration Required:');
        console.log('Please run this SQL in your Supabase SQL Editor:');
        console.log(`
          ALTER TABLE public.user_portfolios 
          ADD COLUMN IF NOT EXISTS theme_name TEXT DEFAULT 'Midnight Dusk';
        `);
        return;
      }
      
      if (portfolios && portfolios.length > 0) {
        const { error: updateError } = await supabase
          .from('user_portfolios')
          .update({ theme_name: 'Midnight Dusk' })
          .eq('id', portfolios[0].id);
        
        if (updateError) {
          console.error('❌ Error updating portfolio:', updateError);
          console.log('\n💡 Manual Migration Required:');
          console.log('Please run this SQL in your Supabase SQL Editor:');
          console.log(`
            ALTER TABLE public.user_portfolios 
            ADD COLUMN IF NOT EXISTS theme_name TEXT DEFAULT 'Midnight Dusk';
          `);
          return;
        } else {
          console.log('✅ Successfully updated portfolio with theme_name');
        }
      }
    } else {
      console.log('✅ theme_name column added successfully');
    }

    // Verify the column was added
    console.log('\n🔍 Verifying migration...');
    const { data: testPortfolio, error: testError } = await supabase
      .from('user_portfolios')
      .select('id, theme_name')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error verifying migration:', testError);
    } else if (testPortfolio && testPortfolio.length > 0) {
      console.log('✅ Migration verified successfully');
      console.log('Sample portfolio theme_name:', testPortfolio[0].theme_name);
    }

  } catch (error) {
    console.error('❌ Migration error:', error);
    console.log('\n💡 Manual Migration Required:');
    console.log('Please run this SQL in your Supabase SQL Editor:');
    console.log(`
      ALTER TABLE public.user_portfolios 
      ADD COLUMN IF NOT EXISTS theme_name TEXT DEFAULT 'Midnight Dusk';
    `);
  }
}

runThemeMigration(); 