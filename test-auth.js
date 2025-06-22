// Simple test script to verify auth page functionality
// Run this in the browser console on the sign-in or sign-up page

console.log('🧪 Testing Auth Pages...');

function getCurrentPage() {
    if (window.location.pathname.includes('signin')) return 'Sign-In';
    if (window.location.pathname.includes('signup')) return 'Sign-Up';
    return 'Unknown';
}

// Test 1: Check if the light theme is applied
function testTheme() {
  console.log('🎨 Testing theme...');
  
  const body = document.body;
  const hasBackgroundClass = body.className.includes('bg-gray-50');
  
  console.log('Light background:', hasBackgroundClass ? '✅ Applied' : '❌ Missing');
  
  return hasBackgroundClass;
}

// Test 2: Check if form and key elements are rendered
function testFormElements() {
  console.log('📄 Testing form elements...');
  
  const form = document.querySelector('form');
  const emailInput = document.querySelector('input[name="email"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const submitButton = document.querySelector('button[type="submit"]');
  
  console.log('Form:', form ? '✅ Found' : '❌ Missing');
  console.log('Email input:', emailInput ? '✅ Found' : '❌ Missing');
  console.log('Password input:', passwordInput ? '✅ Found' : '❌ Missing');
  console.log('Submit button:', submitButton ? '✅ Found' : '❌ Missing');

  if (getCurrentPage() === 'Sign-Up') {
    const fullNameInput = document.querySelector('input[name="fullName"]');
    console.log('Full Name input:', fullNameInput ? '✅ Found' : '❌ Missing');
    return form && emailInput && passwordInput && submitButton && fullNameInput;
  }
  
  return form && emailInput && passwordInput && submitButton;
}

// Test 3: Check for navigation links
function testNavigationLinks() {
  console.log('🔗 Testing navigation links...');
  
  const welcomeLink = document.querySelector('a[href="/welcome"]');
  const otherAuthLink = getCurrentPage() === 'Sign-In' 
    ? document.querySelector('a[href="/auth/signup"]')
    : document.querySelector('a[href="/auth/signin"]');

  console.log('Welcome link:', welcomeLink ? '✅ Found' : '❌ Missing');
  console.log('Link to other auth page:', otherAuthLink ? '✅ Found' : '❌ Missing');
  
  return welcomeLink && otherAuthLink;
}

// Run all tests
function runAllTests() {
  const page = getCurrentPage();
  console.log(`🚀 Starting comprehensive tests for ${page} page...\n`);
  
  const results = {
    theme: testTheme(),
    formElements: testFormElements(),
    navLinks: testNavigationLinks(),
  };
  
  console.log('\n📊 Test Results:');
  console.log('Theme:', results.theme ? '✅ PASS' : '❌ FAIL');
  console.log('Form Elements:', results.formElements ? '✅ PASS' : '❌ FAIL');
  console.log('Navigation Links:', results.navLinks ? '✅ PASS' : '❌ FAIL');
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log(`🎉 All tests passed! Your ${page} page is working perfectly!`);
  } else {
    console.log(`⚠️ Some tests failed on the ${page} page. Check the details above.`);
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
window.testAuthPage = runAllTests; 