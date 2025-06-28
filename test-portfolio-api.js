async function testPortfolioAPI() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('Testing portfolio generation API...');
  
  const testData = {
    prompt: "A full-stack developer specializing in React and Node.js",
    currentPortfolio: {
      id: "test-id",
      name: "Test Portfolio",
      theme_name: "White",
      sections_config: {
        hero: { enabled: true, title: "Welcome" },
        about: { enabled: true, title: "About Me" },
        contact: { enabled: true, title: "Contact" }
      }
    }
  };

  try {
    const response = await fetch('http://localhost:3000/api/generate-portfolio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Success! Generated data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error calling API:', error);
    console.error('Error message:', error.message);
  }
}

testPortfolioAPI(); 