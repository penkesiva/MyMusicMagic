// Simple test script to verify dashboard functionality
// Run this in the browser console on your dashboard page

console.log('🧪 Testing Dashboard Page...');

// Test 1: Check if the dark theme is applied
function testTheme() {
  console.log('🎨 Testing theme...');
  
  const body = document.body;
  const hasDarkBackground = body.className.includes('bg-gray-900');
  const hasTextColor = body.className.includes('text-gray-200');
  
  console.log('Dark background:', hasDarkBackground ? '✅ Applied' : '❌ Missing');
  console.log('Text color:', hasTextColor ? '✅ Applied' : '❌ Missing');
  
  return hasDarkBackground && hasTextColor;
}

// Test 2: Check if main sections are rendered
function testSections() {
  console.log('📄 Testing sections...');
  
  const sections = {
    header: document.querySelector('header'),
    subscription: document.querySelector('.lg\\:col-span-1'),
    profile: document.querySelector('.lg\\:col-span-1'),
    portfolios: document.querySelector('.lg\\:col-span-2'),
  };
  
  for (const [name, el] of Object.entries(sections)) {
    console.log(`${name} section:`, el ? '✅ Found' : '❌ Missing');
  }
  
  return Object.values(sections).every(el => el !== null);
}

// Test 3: Check for interactive elements
function testInteractiveElements() {
  console.log('🖱️ Testing interactive elements...');
  
  const elements = {
    signOut: document.querySelector('button.bg-red-600'),
    editProfile: document.querySelector('button.text-blue-400'),
    createPortfolio: document.querySelector('button.bg-blue-600'),
  };
  
  for (const [name, el] of Object.entries(elements)) {
    console.log(`${name} button:`, el ? '✅ Found' : '❌ Missing');
  }
  
  return Object.values(elements).every(el => el !== null);
}

// Test 4: Check if portfolio list is rendered
function testPortfolioList() {
  console.log('📊 Testing portfolio list...');
  
  const portfolioItems = document.querySelectorAll('.lg\\:col-span-2 .space-y-4 > div');
  
  console.log('Portfolio items found:', portfolioItems.length);
  
  // This test passes if there's at least one portfolio or the "no portfolios" message
  if (portfolioItems.length > 0) {
    return true;
  }
  
  const noPortfoliosMessage = document.querySelector('.lg\\:col-span-2 .text-center');
  console.log('No portfolios message:', noPortfoliosMessage ? '✅ Found' : '❌ Missing');
  
  return noPortfoliosMessage !== null;
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting comprehensive dashboard tests...\n');
  
  const results = {
    theme: testTheme(),
    sections: testSections(),
    interactive: testInteractiveElements(),
    portfolioList: testPortfolioList(),
  };
  
  console.log('\n📊 Test Results:');
  console.log('Theme:', results.theme ? '✅ PASS' : '❌ FAIL');
  console.log('Sections:', results.sections ? '✅ PASS' : '❌ FAIL');
  console.log('Interactive Elements:', results.interactive ? '✅ PASS' : '❌ FAIL');
  console.log('Portfolio List:', results.portfolioList ? '✅ PASS' : '❌ FAIL');
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your dashboard is working perfectly!');
  } else {
    console.log('⚠️ Some tests failed. Check the details above.');
  }
  
  return results;
}

// Auto-run tests after page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runAllTests);
} else {
  runAllTests();
}

// Export for manual testing
window.testDashboard = runAllTests; 