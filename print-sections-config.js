// Print sections_config for all portfolios
const { createClient } = require('./lib/supabase/client');

(async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_portfolios')
    .select('id, name, sections_config');

  if (error) {
    console.error('❌ Error fetching portfolios:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No portfolios found.');
    process.exit(0);
  }

  data.forEach((portfolio) => {
    console.log('------------------------------');
    console.log('ID:', portfolio.id);
    console.log('Name:', portfolio.name);
    console.log('sections_config:', JSON.stringify(portfolio.sections_config, null, 2));
    if (portfolio.sections_config?.about) {
      console.log('About view_type:', portfolio.sections_config.about.view_type);
    }
  });
})(); 