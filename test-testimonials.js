const { createClient } = require('@supabase/supabase-js');

// You'll need to add your Supabase URL and anon key here
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTestimonials() {
  try {
    console.log('Testing testimonials feature...');

    // Get a portfolio to test with
    const { data: portfolios, error: fetchError } = await supabase
      .from('user_portfolios')
      .select('id, testimonials_title, testimonials_json')
      .limit(1);

    if (fetchError) {
      console.error('Error fetching portfolios:', fetchError);
      return;
    }

    if (portfolios.length === 0) {
      console.log('No portfolios found to test with');
      return;
    }

    const portfolio = portfolios[0];
    console.log('Testing with portfolio:', portfolio.id);
    console.log('Current testimonials:', portfolio.testimonials_json);

    // Test updating testimonials
    const testTestimonials = [
      {
        id: "1",
        name: "Sarah Johnson",
        role: "Music Producer",
        company: "Studio Records",
        content: "Working with this artist was an absolute pleasure. Their creativity and attention to detail brought our project to life in ways I never expected.",
        image_url: "",
        rating: 5
      },
      {
        id: "2", 
        name: "Michael Chen",
        role: "A&R Director",
        company: "Global Music",
        content: "Exceptional talent and professionalism. This artist consistently delivers high-quality work that exceeds expectations.",
        image_url: "",
        rating: 5
      },
      {
        id: "3",
        name: "Emma Rodriguez",
        role: "Event Coordinator",
        company: "Live Events Co",
        content: "The performance was absolutely incredible. The audience was captivated from start to finish. Highly recommended!",
        image_url: "",
        rating: 5
      }
    ];

    const { error: updateError } = await supabase
      .from('user_portfolios')
      .update({ 
        testimonials_json: testTestimonials,
        testimonials_title: 'Testimonials'
      })
      .eq('id', portfolio.id);

    if (updateError) {
      console.error('Error updating testimonials:', updateError);
      return;
    }

    console.log('✅ Successfully updated testimonials');
    console.log('Testimonials feature is working!');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testTestimonials(); 