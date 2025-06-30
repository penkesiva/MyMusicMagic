// Test script for section persistence functionality
// Run this in the browser console on the portfolio editor page

console.log('🧪 Testing Section Persistence...');

// Test 1: Check if localStorage is working
function testLocalStorage() {
  const testKey = 'test-section-persistence';
  const testValue = { hero: true, about: false, tracks: true };
  
  try {
    localStorage.setItem(testKey, JSON.stringify(testValue));
    const retrieved = JSON.parse(localStorage.getItem(testKey));
    localStorage.removeItem(testKey);
    
    if (JSON.stringify(retrieved) === JSON.stringify(testValue)) {
      console.log('✅ localStorage is working correctly');
      return true;
    } else {
      console.log('❌ localStorage test failed');
      return false;
    }
  } catch (error) {
    console.log('❌ localStorage error:', error);
    return false;
  }
}

// Test 2: Check current section state
function checkCurrentState() {
  const portfolioId = window.location.pathname.split('/')[3]; // Extract ID from URL
  const savedState = localStorage.getItem(`portfolio-${portfolioId}-openSections`);
  
  console.log('📊 Current saved state:', savedState ? JSON.parse(savedState) : 'None');
  console.log('🔗 Portfolio ID:', portfolioId);
  
  return savedState;
}

// Test 3: Simulate section toggle
function simulateSectionToggle() {
  const portfolioId = window.location.pathname.split('/')[3];
  const currentState = localStorage.getItem(`portfolio-${portfolioId}-openSections`);
  const parsedState = currentState ? JSON.parse(currentState) : {};
  
  // Toggle hero section
  const newState = { ...parsedState, hero: !parsedState.hero };
  localStorage.setItem(`portfolio-${portfolioId}-openSections`, JSON.stringify(newState));
  
  console.log('🔄 Simulated hero section toggle');
  console.log('📊 New state:', newState);
  
  return newState;
}

// Test 4: Clear saved state
function clearSavedState() {
  const portfolioId = window.location.pathname.split('/')[3];
  localStorage.removeItem(`portfolio-${portfolioId}-openSections`);
  console.log('🗑️ Cleared saved section state');
}

// Run tests
console.log('=== Section Persistence Tests ===');
testLocalStorage();
checkCurrentState();

console.log('\n=== Available Test Functions ===');
console.log('- simulateSectionToggle(): Toggle hero section state');
console.log('- clearSavedState(): Clear saved state');
console.log('- checkCurrentState(): Check current saved state');

console.log('\n💡 To test persistence:');
console.log('1. Toggle some sections in the editor');
console.log('2. Refresh the page');
console.log('3. Check if sections remain in the same state');
console.log('4. Use checkCurrentState() to verify saved data'); 