# Airbnb Search Animation Implementation Guide
## High-Level Implementation in Vanilla JavaScript

---

## Table of Contents
1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [HTML Structure](#html-structure)
4. [CSS Foundation](#css-foundation)
5. [JavaScript Implementation](#javascript-implementation)
6. [Animation Techniques](#animation-techniques)
7. [Timing & Lifecycle](#timing--lifecycle)
8. [Positioning Logic](#positioning-logic)
9. [Common Pitfalls](#common-pitfalls)
10. [Best Practices](#best-practices)

---

## Overview

### What We're Building
An interactive search bar with three sections (Where, When, Who) that features:
- **Morphing background indicator** that animates between active sections
- **Content panel** that slides down from the top with section-specific content
- **Smooth cross-fade animations** for content transitions
- **Smart positioning** that adapts based on the active section

### Key Features
- ✅ Top-down dropdown animation (like iOS Dynamic Island)
- ✅ No blinks or flashes during transitions
- ✅ Physics-based spring animations
- ✅ Responsive positioning
- ✅ Smooth content cross-fade

---

## Core Concepts

### 1. Morphing Background Indicator
The white background indicator animates its position, width, and height to "morph" into whichever section is active.

**Key Properties:**
- `position: absolute` - Positioned relative to search bar
- `pointer-events: none` - Allows clicks to pass through
- `z-index: 1` - Behind section buttons but above search bar background
- Initial state: `opacity: 0`

### 2. Content Panel Animation Phases
The content panel animation happens in **two separate phases**:

**Phase 1: Container Morph**
- Panel drops down from above (`translateY: -16px → 0`)
- Fades in (`opacity: 0 → 1`)
- Positions horizontally (`left: calculated position`)

**Phase 2: Content Cross-Fade**
- Children start hidden and slightly below (`opacity: 0, translateY: 8px`)
- Fade in and rise up (`opacity: 1, translateY: 0`)
- Slight scale effect (`scale: 0.96 → 1`)

### 3. Timing Strategy
**Critical Understanding:** Measurements must happen AFTER the DOM updates.

```
User Click
    ↓
Update State
    ↓
Wait for Browser Render (requestAnimationFrame or similar)
    ↓
Measure New Component Dimensions
    ↓
Calculate Positions
    ↓
Animate
```

---

## HTML Structure

```html
<div class="airbnb-search-container">
  <!-- Search Bar -->
  <div class="search-bar" id="searchBar">

    <!-- Active Indicator Background -->
    <div class="active-indicator" id="indicator"></div>

    <!-- Where Section -->
    <button class="search-section" id="whereSection" data-section="where">
      <div class="section-label">Where</div>
      <div class="section-value" id="whereValue">Search destinations</div>
    </button>

    <!-- Divider -->
    <div class="section-divider"></div>

    <!-- When Section -->
    <button class="search-section" id="whenSection" data-section="when">
      <div class="section-label">When</div>
      <div class="section-value" id="whenValue">Add dates</div>
    </button>

    <!-- Divider -->
    <div class="section-divider"></div>

    <!-- Who Section -->
    <button class="search-section who-section" id="whoSection" data-section="who">
      <div class="section-content">
        <div class="section-label">Who</div>
        <div class="section-value" id="whoValue">Add guests</div>
      </div>

      <!-- Search Button -->
      <button class="search-btn" id="searchBtn">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
        <span>Search</span>
      </button>
    </button>
  </div>

  <!-- Content Panel (initially hidden) -->
  <div class="content-panel" id="contentPanel" style="display: none;">
    <!-- Content will be dynamically inserted here -->
  </div>
</div>
```

---

## CSS Foundation

```css
.airbnb-search-container {
  position: relative;
  margin: 2rem auto;
  max-width: 850px;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 60px;
  padding: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
}

.search-bar:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* ========================================
   ACTIVE INDICATOR - The Morphing Background
   ======================================== */
.active-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100%;
  background: white;
  border-radius: 60px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12), 0 3px 6px rgba(0, 0, 0, 0.08);
  pointer-events: none; /* Allow clicks to pass through */
  z-index: 1;
  opacity: 0; /* Initially hidden */
  will-change: transform, opacity, width, height, left, top;
}

/* ========================================
   SEARCH SECTIONS - Clickable Buttons
   ======================================== */
.search-section {
  position: relative;
  z-index: 2; /* Above indicator */
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.875rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: 60px;
  cursor: pointer;
  transition: background 0.2s ease;
  text-align: left;
}

.search-section:hover:not(.active) {
  background: #ebebeb;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.125rem;
}

.section-value {
  font-size: 0.875rem;
  color: #717171;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

/* ========================================
   CONTENT PANEL - The Dropdown
   ======================================== */
.content-panel {
  position: absolute;
  top: calc(100% + 0.75rem);
  left: 0;
  width: fit-content;
  max-width: calc(100vw - 2rem);
  background: white;
  border-radius: 32px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.12), 0 4px 24px rgba(0, 0, 0, 0.08);
  z-index: 10;
  overflow: hidden;
  will-change: height, left, transform, opacity;

  /* CRITICAL: Initial hidden state for smooth first appearance */
  transform-origin: top center;
  opacity: 0;
  transform: translateY(-16px);
}
```

### CSS Key Points:

1. **`will-change` property**: Tells browser to optimize these properties for animation
2. **`transform-origin: top center`**: Ensures transformations happen from the top-center
3. **Initial hidden state in CSS**: Prevents flash on first render
4. **`pointer-events: none` on indicator**: Allows button clicks to work

---

## JavaScript Implementation

### State Management

```javascript
// Global state
let activeSection = null; // 'where' | 'when' | 'who' | null

// DOM references
const searchBar = document.getElementById('searchBar');
const indicator = document.getElementById('indicator');
const contentPanel = document.getElementById('contentPanel');
const sections = {
  where: document.getElementById('whereSection'),
  when: document.getElementById('whenSection'),
  who: document.getElementById('whoSection')
};
```

### Event Listeners

```javascript
// Attach click handlers to all sections
Object.keys(sections).forEach(sectionName => {
  const button = sections[sectionName];

  button.addEventListener('click', () => {
    // Toggle: if clicking same section, close it
    if (activeSection === sectionName) {
      setActiveSection(null);
    } else {
      setActiveSection(sectionName);
    }
  });
});

// Close panel when clicking outside
document.addEventListener('click', (e) => {
  if (!searchBar.contains(e.target) && !contentPanel.contains(e.target)) {
    setActiveSection(null);
  }
});
```

### Core Animation Logic

```javascript
function setActiveSection(section) {
  activeSection = section;

  // Update active class
  Object.keys(sections).forEach(key => {
    sections[key].classList.toggle('active', key === section);
  });

  // Animate indicator
  animateIndicator(section);

  // Animate content panel
  if (section) {
    showContentPanel(section);
  } else {
    hideContentPanel();
  }
}
```

### Indicator Animation

```javascript
function animateIndicator(section) {
  if (!section) {
    // Hide indicator
    animate(indicator,
      { opacity: 0, scale: 0.96 },
      {
        duration: 0.25,
        type: 'spring',
        stiffness: 500,
        damping: 35
      }
    );
    return;
  }

  // Get section dimensions
  const sectionElement = sections[section];
  const searchBarRect = searchBar.getBoundingClientRect();
  const sectionRect = sectionElement.getBoundingClientRect();

  // Calculate position relative to search bar
  const left = sectionRect.left - searchBarRect.left;
  const top = sectionRect.top - searchBarRect.top;
  const width = sectionRect.width;
  const height = sectionRect.height;

  // Animate indicator to morph into active section
  animate(indicator,
    {
      opacity: 1,
      scale: 1,
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`
    },
    {
      duration: 0.45,
      type: 'spring',
      stiffness: 300,
      damping: 25,
      mass: 0.8
    }
  );
}
```

### Content Panel Animation

```javascript
function showContentPanel(section) {
  // 1. Update content based on section
  updatePanelContent(section);

  // 2. Show panel (but still hidden via CSS)
  contentPanel.style.display = 'block';

  // 3. CRITICAL: Wait for next frame to measure NEW content
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      animateContentPanelIn(section);
    });
  });
}

function animateContentPanelIn(section) {
  const sectionElement = sections[section];
  const searchBarRect = searchBar.getBoundingClientRect();
  const sectionRect = sectionElement.getBoundingClientRect();
  const searchBarWidth = searchBar.offsetWidth;

  // Temporarily reset styles to measure natural dimensions
  contentPanel.style.height = 'auto';
  contentPanel.style.width = 'fit-content';

  const children = Array.from(contentPanel.children);

  // Reset transforms (but keep opacity 0)
  children.forEach(child => {
    child.style.transform = 'none';
  });

  // Force reflow to get accurate measurements
  const _ = contentPanel.offsetHeight;

  // Measure actual dimensions
  const actualPanelWidth = contentPanel.offsetWidth;

  // Calculate horizontal position based on section
  let leftPosition;
  const padding = 8;

  if (section === 'where') {
    // Align with Where button (left)
    leftPosition = sectionRect.left - searchBarRect.left;
  } else if (section === 'when') {
    // Center the panel
    leftPosition = (searchBarWidth - actualPanelWidth) / 2;
  } else if (section === 'who') {
    // Right-align
    leftPosition = searchBarWidth - actualPanelWidth - padding;
  }

  // Ensure panel stays within bounds
  leftPosition = Math.max(padding, Math.min(leftPosition, searchBarWidth - actualPanelWidth - padding));

  // Set initial state for children
  children.forEach(child => {
    child.style.opacity = '0';
    child.style.transform = 'scale(0.96) translateY(8px)';
  });

  // PHASE 1: Animate panel container (top-down drop)
  animate(contentPanel,
    {
      opacity: 1,
      y: 0,
      left: `${leftPosition}px`
    },
    {
      duration: 0.45,
      type: 'spring',
      stiffness: 300,
      damping: 25,
      mass: 0.8
    }
  );

  // PHASE 2: Animate children (cross-fade)
  animate(children,
    {
      opacity: 1,
      scale: 1,
      y: 0
    },
    {
      duration: 0.45,
      type: 'spring',
      stiffness: 300,
      damping: 25,
      mass: 0.8
    }
  );
}

function hideContentPanel() {
  animate(contentPanel,
    { opacity: 0, y: -16 },
    { duration: 0.3 }
  ).finished.then(() => {
    contentPanel.style.display = 'none';
  });
}
```

### Content Rendering

```javascript
function updatePanelContent(section) {
  if (section === 'where') {
    contentPanel.innerHTML = `
      <div class="suggestions-container">
        <h3 class="suggestions-title">Search by region</h3>
        <div class="suggestions-list">
          <button class="suggestion-item">
            <span class="suggestion-icon">🌍</span>
            <div class="suggestion-content">
              <div class="suggestion-name">I'm flexible</div>
            </div>
          </button>
          <!-- More suggestions... -->
        </div>
      </div>
    `;
  } else if (section === 'when') {
    contentPanel.innerHTML = `
      <div class="date-picker-container">
        <!-- Date picker UI -->
      </div>
    `;
  } else if (section === 'who') {
    contentPanel.innerHTML = `
      <div class="guest-picker-container">
        <!-- Guest counter UI -->
      </div>
    `;
  }
}
```

---

## Animation Techniques

### Option 1: Using Motion.dev (Recommended)

```javascript
// Install: npm install motion

import { animate } from 'motion';

// Simple animation
animate(element,
  { opacity: 1, x: 100 },
  { duration: 0.5 }
);

// Spring animation (physics-based)
animate(element,
  { opacity: 1, scale: 1 },
  {
    duration: 0.45,
    type: 'spring',
    stiffness: 300,  // Higher = snappier
    damping: 25,     // Higher = less bouncy
    mass: 0.8        // Lower = lighter/faster
  }
);
```

### Option 2: Web Animations API (Native)

```javascript
// Browser native API
element.animate(
  [
    { opacity: 0, transform: 'translateY(-16px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ],
  {
    duration: 450,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'forwards'
  }
);
```

### Option 3: CSS Transitions + Class Toggles

```css
.content-panel {
  opacity: 0;
  transform: translateY(-16px);
  transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-panel.visible {
  opacity: 1;
  transform: translateY(0);
}
```

```javascript
// Toggle class
contentPanel.classList.add('visible');
```

---

## Timing & Lifecycle

### The Critical Rendering Cycle

```
┌─────────────────────────────────────────────────────────┐
│ User clicks "When" button                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ JavaScript: setActiveSection('when')                    │
│ - Update state: activeSection = 'when'                  │
│ - Call updatePanelContent('when')                       │
│ - Set contentPanel.style.display = 'block'              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Browser: Schedule render                                │
│ - Queues DOM updates                                    │
│ - Has NOT painted yet                                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ requestAnimationFrame callback #1                       │
│ - Browser is ABOUT to paint                             │
│ - Still safe to read layout (may trigger reflow)        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ requestAnimationFrame callback #2 (NESTED)              │
│ - Browser HAS painted the new content                   │
│ ✅ NOW we can measure accurate dimensions               │
│ ✅ Calculate positions                                  │
│ ✅ Start animations                                     │
└─────────────────────────────────────────────────────────┘
```

### Why Double requestAnimationFrame?

```javascript
// WRONG: Measures before DOM update
contentPanel.style.display = 'block';
const width = contentPanel.offsetWidth; // ❌ May get 0 or old value

// CORRECT: Measures after DOM update
contentPanel.style.display = 'block';
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const width = contentPanel.offsetWidth; // ✅ Accurate!
  });
});
```

**Alternative using setTimeout:**
```javascript
contentPanel.style.display = 'block';
setTimeout(() => {
  const width = contentPanel.offsetWidth; // ✅ Also works
}, 0);
```

---

## Positioning Logic

### Smart Horizontal Positioning

```javascript
function calculateLeftPosition(section, panelWidth, searchBarWidth) {
  const padding = 8; // Minimum edge padding
  let leftPosition;

  switch(section) {
    case 'where':
      // Align with left edge of Where button
      const whereRect = sections.where.getBoundingClientRect();
      const searchBarRect = searchBar.getBoundingClientRect();
      leftPosition = whereRect.left - searchBarRect.left;
      break;

    case 'when':
      // Center the panel (symmetric look for calendar)
      leftPosition = (searchBarWidth - panelWidth) / 2;
      break;

    case 'who':
      // Right-align with search bar
      leftPosition = searchBarWidth - panelWidth - padding;
      break;
  }

  // Boundary enforcement: keep panel within search bar bounds
  leftPosition = Math.max(
    padding,                                    // Don't go past left edge
    Math.min(
      leftPosition,                             // Desired position
      searchBarWidth - panelWidth - padding     // Don't go past right edge
    )
  );

  return leftPosition;
}
```

### Why Different Positioning?

| Section | Width | Positioning Strategy | Reason |
|---------|-------|----------------------|--------|
| **Where** | ~600px | Left-aligned | Natural flow from button |
| **When** | ~750px | Centered | Calendar looks best centered |
| **Who** | ~400px | Right-aligned | Near search button |

---

## Common Pitfalls

### 1. ❌ Flash/Blink When Switching Sections

**Symptom:** Panel briefly disappears when switching from "Where" to "When"

**Cause:**
```javascript
// BAD: This hides visible content immediately!
function showContentPanel(section) {
  contentPanel.style.opacity = '0'; // ❌ Causes flash
  contentPanel.style.transform = 'translateY(-16px)';

  updatePanelContent(section);
  // Then animates back in...
}
```

**Solution:**
```javascript
// GOOD: Only CSS sets initial state, JavaScript never hides
// CSS already handles: opacity: 0; transform: translateY(-16px);
// JavaScript only animates TO visible, never manually hides
```

### 2. ❌ Panel Appears From Left Instead of Top

**Symptom:** First click looks like left-slide instead of top-drop

**Cause:**
```css
/* BAD */
.content-panel {
  transform-origin: top left; /* ❌ Scales from corner */
}
```

**Solution:**
```css
/* GOOD */
.content-panel {
  transform-origin: top center; /* ✅ Drops straight down */
  transform: translateY(-16px); /* Only vertical movement */
}
```

### 3. ❌ Wrong Panel Width When Switching

**Symptom:** Switching "Where" → "When" positions panel using old 600px width instead of new 750px

**Cause:**
```javascript
// BAD: Measuring before DOM updates
updatePanelContent('when'); // Changes content to calendar
const width = contentPanel.offsetWidth; // ❌ Still measures old content!
```

**Solution:**
```javascript
// GOOD: Wait for render cycle
updatePanelContent('when');
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const width = contentPanel.offsetWidth; // ✅ Measures new calendar
  });
});
```

### 4. ❌ Children Blink During Measurement

**Symptom:** Quick flash of content during measurement phase

**Cause:**
```javascript
// BAD: Makes children visible during measurement
children.forEach(child => {
  child.style.opacity = '1'; // ❌ Visible flash!
  child.style.transform = 'none';
});
const _ = contentPanel.offsetHeight; // Triggers repaint
```

**Solution:**
```javascript
// GOOD: Elements with opacity: 0 still contribute to layout!
children.forEach(child => {
  // DON'T change opacity, only transform
  child.style.transform = 'none'; // ✅ Measure without showing
});
const _ = contentPanel.offsetHeight;
```

### 5. ❌ Animation Stutters or Drops Frames

**Cause:** Too many reflows/repaints

**Solution:**
- Use `will-change` CSS property on animated elements
- Batch DOM reads before DOM writes
- Prefer `transform` and `opacity` (GPU-accelerated)

```css
.content-panel {
  will-change: transform, opacity; /* Browser optimization hint */
}
```

---

## Best Practices

### Performance Optimization

```javascript
// ✅ GOOD: Batch reads, then batch writes
const reads = {
  searchBarRect: searchBar.getBoundingClientRect(),
  sectionRect: sectionElement.getBoundingClientRect(),
  panelWidth: contentPanel.offsetWidth
};

// Now do writes
contentPanel.style.left = `${calculateLeft(reads)}px`;
indicator.style.width = `${reads.sectionRect.width}px`;

// ❌ BAD: Interleaved reads and writes (causes multiple reflows)
contentPanel.style.left = '100px'; // Write
const width = contentPanel.offsetWidth; // Read (triggers reflow!)
indicator.style.width = '200px'; // Write
const height = indicator.offsetHeight; // Read (another reflow!)
```

### Accessibility

```html
<!-- Add ARIA attributes -->
<button
  class="search-section"
  aria-expanded="false"
  aria-controls="contentPanel">
  Where
</button>

<div
  id="contentPanel"
  role="region"
  aria-live="polite">
  <!-- Content -->
</div>
```

```javascript
// Update ARIA states
button.setAttribute('aria-expanded', activeSection === 'where');
```

### Keyboard Navigation

```javascript
// Allow keyboard users to open/close
sections.where.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    setActiveSection('where');
  }

  if (e.key === 'Escape') {
    setActiveSection(null);
  }
});
```

### Responsive Design

```javascript
// Adjust positioning on small screens
function calculateLeftPosition(section, panelWidth, searchBarWidth) {
  // On mobile, always center the panel
  if (window.innerWidth < 768) {
    return (searchBarWidth - panelWidth) / 2;
  }

  // Desktop: use section-specific positioning
  // ... rest of logic
}

// Listen for resize
window.addEventListener('resize', debounce(() => {
  if (activeSection) {
    animateContentPanelIn(activeSection);
  }
}, 150));
```

### Browser Compatibility

```javascript
// Feature detection for Web Animations API
if (!Element.prototype.animate) {
  // Fallback to CSS transitions
  element.style.transition = 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
  element.style.opacity = '1';
} else {
  // Use animate()
  element.animate(...);
}
```

---

## Complete Working Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Airbnb Search Animation</title>
  <style>
    /* Include all CSS from CSS Foundation section */
  </style>
</head>
<body>
  <!-- Include HTML from HTML Structure section -->

  <script type="module">
    import { animate } from 'https://cdn.skypack.dev/motion';

    // State
    let activeSection = null;

    // DOM references
    const searchBar = document.getElementById('searchBar');
    const indicator = document.getElementById('indicator');
    const contentPanel = document.getElementById('contentPanel');
    const sections = {
      where: document.getElementById('whereSection'),
      when: document.getElementById('whenSection'),
      who: document.getElementById('whoSection')
    };

    // Event listeners
    Object.keys(sections).forEach(sectionName => {
      sections[sectionName].addEventListener('click', () => {
        setActiveSection(activeSection === sectionName ? null : sectionName);
      });
    });

    // Main functions
    function setActiveSection(section) {
      activeSection = section;

      Object.keys(sections).forEach(key => {
        sections[key].classList.toggle('active', key === section);
      });

      animateIndicator(section);

      if (section) {
        showContentPanel(section);
      } else {
        hideContentPanel();
      }
    }

    function animateIndicator(section) {
      // Implementation from JavaScript section
    }

    function showContentPanel(section) {
      // Implementation from JavaScript section
    }

    function hideContentPanel() {
      // Implementation from JavaScript section
    }
  </script>
</body>
</html>
```

---

## Summary & Key Takeaways

### ✅ Do's
1. **Set initial hidden state in CSS** - Prevents flashes on first render
2. **Wait for render cycle before measuring** - Use double `requestAnimationFrame`
3. **Only reset transform for measurements** - Don't change opacity unnecessarily
4. **Use `transform-origin: top center`** - For straight top-down animations
5. **Batch DOM reads before writes** - Minimize reflows

### ❌ Don'ts
1. **Don't manually hide panel in JavaScript** - CSS handles initial state
2. **Don't measure before DOM updates** - You'll get stale dimensions
3. **Don't set opacity during measurements** - Causes visible blinks
4. **Don't interleave reads and writes** - Causes layout thrashing
5. **Don't animate properties other than transform/opacity** - Poor performance

### Animation Formula
```
First Render:  CSS (opacity: 0) → JS measures → JS animates to visible
Switching:     Keep visible → Update content → Wait for render → Animate position
```

### Performance Checklist
- [ ] Use `will-change` on animated elements
- [ ] Prefer `transform` and `opacity` (GPU-accelerated)
- [ ] Double `requestAnimationFrame` for measurements
- [ ] Batch DOM operations
- [ ] Debounce resize listeners

---

## Resources

- **Motion.dev Docs**: https://motion.dev
- **Web Animations API**: https://developer.mozilla.org/en-US/Web/API/Web_Animations_API
- **Rendering Performance**: https://web.dev/rendering-performance/
- **CSS Triggers**: https://csstriggers.com/

---

**Created:** 2025-10-18
**Version:** 1.0
**Based on:** Angular implementation at `src/app/airbnb-search/airbnb-search.ts`
