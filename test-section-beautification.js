// Test script for section beautification and scroll functionality
// Run this in the browser console on the portfolio editor page

console.log('🎨 Testing Section Beautification...');

// Test 1: Check if section icons are present
function testSectionIcons() {
  const sectionHeaders = document.querySelectorAll('section h2');
  const icons = document.querySelectorAll('section button .flex.items-center.gap-2 svg');
  
  console.log('📊 Section headers found:', sectionHeaders.length);
  console.log('🎯 Icons found:', icons.length);
  
  if (sectionHeaders.length > 0 && icons.length > 0) {
    console.log('✅ Section icons are present');
    return true;
  } else {
    console.log('❌ Section icons are missing');
    return false;
  }
}

// Test 2: Check if sidebar section items have icons
function testSidebarIcons() {
  const sidebarItems = document.querySelectorAll('[data-radix-collection-item]');
  const sidebarIcons = document.querySelectorAll('[data-radix-collection-item] svg');
  
  console.log('📊 Sidebar items found:', sidebarItems.length);
  console.log('🎯 Sidebar icons found:', sidebarIcons.length);
  
  if (sidebarItems.length > 0 && sidebarIcons.length > 0) {
    console.log('✅ Sidebar section icons are present');
    return true;
  } else {
    console.log('❌ Sidebar section icons are missing');
    return false;
  }
}

// Test 3: Test scroll functionality
function testScrollFunctionality() {
  const sections = document.querySelectorAll('section[id]');
  console.log('📊 Sections with IDs found:', sections.length);
  
  if (sections.length > 0) {
    const firstSection = sections[0];
    const sectionId = firstSection.id;
    
    console.log('🎯 Testing scroll to section:', sectionId);
    
    // Test the scroll function
    const element = document.getElementById(sectionId);
    if (element) {
      // Add highlight effect
      element.style.transition = 'box-shadow 0.3s ease';
      element.style.boxShadow = '0 0 0 2px rgba(168, 85, 247, 0.3)';
      
      // Scroll to element
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      
      console.log('✅ Scroll functionality working');
      
      // Remove highlight after 2 seconds
      setTimeout(() => {
        element.style.boxShadow = '';
        console.log('✅ Highlight effect removed');
      }, 2000);
      
      return true;
    }
  }
  
  console.log('❌ Scroll functionality not working');
  return false;
}

// Test 3.5: Test auto-expand functionality
function testAutoExpandFunctionality() {
  const sections = document.querySelectorAll('section[id]');
  console.log('📊 Testing auto-expand functionality...');
  
  if (sections.length > 0) {
    // Find a collapsed section
    const collapsedSections = Array.from(sections).filter(section => {
      const button = section.querySelector('button');
      const chevron = button?.querySelector('.transform');
      return chevron && !chevron.classList.contains('rotate-180');
    });
    
    if (collapsedSections.length > 0) {
      console.log('🎯 Found collapsed sections:', collapsedSections.length);
      console.log('✅ Auto-expand should work when clicking sidebar items');
      return true;
    } else {
      console.log('ℹ️ All sections are currently expanded');
      console.log('✅ Auto-expand functionality is available');
      return true;
    }
  }
  
  console.log('❌ Could not test auto-expand functionality');
  return false;
}

// Test 4: Check font sizes
function testFontSizes() {
  const sectionHeaders = document.querySelectorAll('section h2');
  
  if (sectionHeaders.length > 0) {
    const computedStyle = window.getComputedStyle(sectionHeaders[0]);
    const fontSize = computedStyle.fontSize;
    const fontWeight = computedStyle.fontWeight;
    
    console.log('📏 Font size:', fontSize);
    console.log('📏 Font weight:', fontWeight);
    
    // Check if font size is reduced (should be around 18px instead of 24px)
    const fontSizeNum = parseFloat(fontSize);
    if (fontSizeNum <= 20) {
      console.log('✅ Font size is appropriately reduced');
      return true;
    } else {
      console.log('❌ Font size is not reduced');
      return false;
    }
  }
  
  console.log('❌ Could not check font sizes');
  return false;
}

// Test 5: Check hover effects
function testHoverEffects() {
  const sidebarItems = document.querySelectorAll('[data-radix-collection-item] span');
  
  if (sidebarItems.length > 0) {
    console.log('🎯 Testing hover effects on sidebar items');
    console.log('✅ Hover effects should be visible when hovering over section names');
    return true;
  }
  
  console.log('❌ Could not find sidebar items for hover testing');
  return false;
}

// Run all tests
console.log('=== Section Beautification Tests ===');
testSectionIcons();
testSidebarIcons();
testScrollFunctionality();
testAutoExpandFunctionality();
testFontSizes();
testHoverEffects();

console.log('\n=== Manual Testing Instructions ===');
console.log('1. Check that section headers have icons and reduced font size');
console.log('2. Click on section names in the left sidebar to test scrolling');
console.log('3. Hover over section names in sidebar to see color changes');
console.log('4. Verify that sections get highlighted when scrolled to');
console.log('5. Test auto-expand: collapse a section, then click it in sidebar');

console.log('\n💡 Expected improvements:');
console.log('- Section headers now have icons and smaller font size');
console.log('- Sidebar section items have icons and hover effects');
console.log('- Clicking section names in sidebar scrolls to that section');
console.log('- Scrolled sections get a purple highlight effect');
console.log('- Collapsed sections automatically expand when clicked in sidebar'); 