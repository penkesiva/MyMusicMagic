const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function listPortfolios() {
  const { data, error } = await supabase
    .from('user_portfolios')
    .select('id, name, hero_title, artist_name, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching portfolios:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No portfolios found.');
    return;
  }

  console.log('Portfolios:');
  data.forEach((p, i) => {
    console.log(`\n#${i + 1}`);
    console.log('ID:         ', p.id);
    console.log('Name:       ', p.name);
    console.log('Hero Title: ', p.hero_title);
    console.log('Artist Name:', p.artist_name);
    console.log('Created At: ', p.created_at);
  });
}

listPortfolios(); 