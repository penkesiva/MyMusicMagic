// Simple test script to verify welcome page functionality
// Run this in the browser console on the welcome page

console.log('🧪 Testing Welcome Page...');

// Test 1: Check if the light theme is applied
function testTheme() {
  console.log('🎨 Testing theme...');
  
  const body = document.body;
  const hasBackgroundClass = body.className.includes('bg-white');
  const hasTextColor = body.className.includes('text-gray-800');
  
  console.log('Light background:', hasBackgroundClass ? '✅ Applied' : '❌ Missing');
  console.log('Text color:', hasTextColor ? '✅ Applied' : '❌ Missing');
  
  return hasBackgroundClass && hasTextColor;
}

// Test 2: Check if main sections are rendered
function testSections() {
  console.log('📄 Testing sections...');
  
  const sections = {
    header: document.querySelector('header'),
    hero: document.querySelector('main'),
    features: document.querySelector('section:nth-of-type(1)'),
    testimonial: document.querySelector('section:nth-of-type(2)'),
    cta: document.querySelector('section:nth-of-type(3)'),
    footer: document.querySelector('footer'),
  };
  
  for (const [name, el] of Object.entries(sections)) {
    console.log(`${name} section:`, el ? '✅ Found' : '❌ Missing');
  }
  
  return Object.values(sections).every(el => el !== null);
}

// Test 3: Check for call-to-action buttons
function testCallToActionButtons() {
  console.log('🎯 Testing call-to-action buttons...');
  
  const ctaButtons = document.querySelectorAll('a[href="/auth/signup"]');
  const signInButton = document.querySelector('a[href="/auth/signin"]');
  
  console.log('Sign-up buttons found:', ctaButtons.length);
  console.log('Sign-in button:', signInButton ? '✅ Found' : '❌ Missing');
  
  return ctaButtons.length > 0 && signInButton !== null;
}

// Test 4: Check if features are rendered
function testFeatures() {
  console.log('✨ Testing features...');
  
  const featureItems = document.querySelectorAll('section:nth-of-type(1) .grid > div');
  
  console.log('Feature items found:', featureItems.length);
  
  return featureItems.length > 0;
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting comprehensive welcome page tests...\n');
  
  const results = {
    theme: testTheme(),
    sections: testSections(),
    ctaButtons: testCallToActionButtons(),
    features: testFeatures(),
  };
  
  console.log('\n📊 Test Results:');
  console.log('Theme:', results.theme ? '✅ PASS' : '❌ FAIL');
  console.log('Sections:', results.sections ? '✅ PASS' : '❌ FAIL');
  console.log('CTA Buttons:', results.ctaButtons ? '✅ PASS' : '❌ FAIL');
  console.log('Features:', results.features ? '✅ PASS' : '❌ FAIL');
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your welcome page is working perfectly!');
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
window.testWelcomePage = runAllTests; 