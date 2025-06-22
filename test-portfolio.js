// Simple test script to verify portfolio functionality
// Run this in the browser console on your portfolio page

console.log('🧪 Testing Portfolio Page...');

// Test 1: Check if theme colors are applied
function testThemeColors() {
  console.log('🎨 Testing theme colors...');
  
  const body = document.body;
  const hasBackgroundClass = body.className.includes('bg-');
  const hasTextClass = body.className.includes('text-');
  
  console.log('Background class:', hasBackgroundClass ? '✅ Applied' : '❌ Missing');
  console.log('Text class:', hasTextClass ? '✅ Applied' : '❌ Missing');
  
  return hasBackgroundClass && hasTextClass;
}

// Test 2: Check if sections are rendered
function testSections() {
  console.log('📄 Testing sections...');
  
  const sections = document.querySelectorAll('section');
  const sectionIds = Array.from(sections).map(s => s.id);
  
  console.log('Found sections:', sectionIds);
  console.log('Section count:', sections.length);
  
  return sections.length > 0;
}

// Test 3: Check if call-to-action buttons exist
function testCallToActionButtons() {
  console.log('🎯 Testing call-to-action buttons...');
  
  const ctaButtons = document.querySelectorAll('a[href="#tracks"], a[href="#contact"], a[href^="mailto:"]');
  const buttonTexts = Array.from(ctaButtons).map(btn => btn.textContent.trim());
  
  console.log('CTA buttons found:', buttonTexts);
  console.log('Button count:', ctaButtons.length);
  
  return ctaButtons.length > 0;
}

// Test 4: Check if images are loading
function testImages() {
  console.log('🖼️ Testing images...');
  
  const images = document.querySelectorAll('img');
  const loadedImages = Array.from(images).filter(img => img.complete && img.naturalHeight !== 0);
  
  console.log('Total images:', images.length);
  console.log('Loaded images:', loadedImages.length);
  
  return loadedImages.length > 0;
}

// Test 5: Check responsive design
function testResponsiveDesign() {
  console.log('📱 Testing responsive design...');
  
  const hasResponsiveClasses = document.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3') !== null;
  const hasFlexClasses = document.querySelector('.flex.flex-col.sm\\:flex-row') !== null;
  
  console.log('Responsive grid:', hasResponsiveClasses ? '✅ Applied' : '❌ Missing');
  console.log('Responsive flex:', hasFlexClasses ? '✅ Applied' : '❌ Missing');
  
  return hasResponsiveClasses || hasFlexClasses;
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting comprehensive portfolio tests...\n');
  
  const results = {
    themeColors: testThemeColors(),
    sections: testSections(),
    ctaButtons: testCallToActionButtons(),
    images: testImages(),
    responsive: testResponsiveDesign()
  };
  
  console.log('\n📊 Test Results:');
  console.log('Theme Colors:', results.themeColors ? '✅ PASS' : '❌ FAIL');
  console.log('Sections:', results.sections ? '✅ PASS' : '❌ FAIL');
  console.log('CTA Buttons:', results.ctaButtons ? '✅ PASS' : '❌ FAIL');
  console.log('Images:', results.images ? '✅ PASS' : '❌ FAIL');
  console.log('Responsive Design:', results.responsive ? '✅ PASS' : '❌ FAIL');
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your portfolio is working perfectly!');
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
window.testPortfolio = runAllTests; 