# Airbnb Search Animation Implementation Guide
## Angular-Specific Implementation with Signals & Effects

---

## Table of Contents
1. [Overview](#overview)
2. [Angular Core Concepts](#angular-core-concepts)
3. [Component Structure](#component-structure)
4. [Template Syntax](#template-syntax)
5. [Component Styling](#component-styling)
6. [TypeScript Implementation](#typescript-implementation)
7. [Animation with Motion.dev](#animation-with-motiondev)
8. [Angular Lifecycle & Timing](#angular-lifecycle--timing)
9. [Reactive State Management](#reactive-state-management)
10. [Angular-Specific Pitfalls](#angular-specific-pitfalls)
11. [Best Practices](#best-practices)
12. [Comparison with Vanilla JS](#comparison-with-vanilla-js)

---

## Overview

### What We're Building
An Angular standalone component with three interactive sections (Where, When, Who) featuring:
- **Signal-based reactive state** - Modern Angular reactivity without RxJS
- **Effects for animations** - Declarative side effects that respond to signal changes
- **Morphing background indicator** - Smooth transitions between sections
- **Content panel animations** - Top-down dropdown with cross-fade
- **afterNextRender timing** - Precise measurement after Angular's render cycle

### Key Angular Features Used
- ✅ **Signals** - Reactive primitive for state management
- ✅ **Effects** - Side effects that run when signals change
- ✅ **viewChild signals** - Type-safe DOM element references
- ✅ **afterNextRender** - Lifecycle hook for post-render operations
- ✅ **Standalone components** - No NgModules required
- ✅ **Modern template syntax** - @if conditional rendering
- ✅ **OnPush change detection** - Optimized performance

---

## Angular Core Concepts

### 1. Signals vs RxJS

**Signals (Modern Angular 16+):**
```typescript
// Creating a signal
const activeSection = signal<SectionType>(null);

// Reading a signal (in template or computed)
const current = activeSection(); // Call like a function

// Updating a signal
activeSection.set('where'); // Set new value
```

**Why Signals over RxJS for this use case:**
- ✅ Simpler API - No subscriptions to manage
- ✅ Automatic cleanup - No need to unsubscribe
- ✅ Fine-grained reactivity - Only updates what changed
- ✅ Better TypeScript inference

### 2. Effects - Declarative Side Effects

```typescript
// Effect runs automatically when signals it reads change
private animateIndicator = effect(() => {
  const active = this.activeSection(); // Tracks this signal
  const indicator = this.indicatorRef()?.nativeElement;

  // When activeSection changes, this entire block re-runs
  if (!indicator) return;

  // Animation logic...
});
```

**Effect Characteristics:**
- Automatically tracks signal dependencies
- Runs in Angular's injection context by default
- Runs at least once on initialization
- Cleans up automatically when component destroys

### 3. viewChild Signals (Angular 17+)

**Old way (decorators):**
```typescript
@ViewChild('indicator') indicator!: ElementRef;

ngAfterViewInit() {
  console.log(this.indicator.nativeElement); // Available after view init
}
```

**New way (signals):**
```typescript
indicatorRef = viewChild<ElementRef>('indicator');

// Use in effect - automatically available when ready
private animate = effect(() => {
  const indicator = this.indicatorRef()?.nativeElement;
  if (!indicator) return; // Not ready yet

  // Use indicator...
});
```

**Benefits:**
- ✅ No lifecycle hooks needed
- ✅ Reactive - effects wait until available
- ✅ Type-safe with generics
- ✅ Simpler code

### 4. afterNextRender - Post-Render Timing

```typescript
afterNextRender(() => {
  // Code here runs AFTER Angular has updated the DOM
  const width = element.offsetWidth; // Accurate measurements
}, { injector: this.injector });
```

**When to use:**
- Measuring DOM elements after content changes
- Initializing third-party libraries that need real DOM
- Animations that depend on final rendered dimensions

**Why injector is needed:**
- Effects provide injection context automatically
- `afterNextRender` inside effect needs explicit injector
- Allows Angular to track and clean up the callback

---

## Component Structure

### Standalone Component Setup

```typescript
import { Component, effect, ElementRef, signal, viewChild, afterNextRender, Injector, inject } from '@angular/core';
import { animate } from 'motion';
import { DestinationSuggestions } from './destination-suggestions/destination-suggestions';
import { DatePicker } from './date-picker/date-picker';
import { GuestPicker } from './guest-picker/guest-picker';

// Type for section state
type SectionType = 'where' | 'when' | 'who' | null;

@Component({
  selector: 'app-airbnb-search',
  imports: [DestinationSuggestions, DatePicker, GuestPicker], // Standalone: direct imports
  templateUrl: './airbnb-search.html',
  styleUrl: './airbnb-search.css'
})
export class AirbnbSearch {
  // Inject Injector for afterNextRender inside effects
  private injector = inject(Injector);

  // State signals
  activeSection = signal<SectionType>(null);
  whereValue = signal('');
  whenValue = signal('');
  whoValue = signal('');

  // ViewChild signals for DOM references
  whereRef = viewChild<ElementRef>('whereSection');
  whenRef = viewChild<ElementRef>('whenSection');
  whoRef = viewChild<ElementRef>('whoSection');
  indicatorRef = viewChild<ElementRef>('indicator');
  searchBarRef = viewChild<ElementRef>('searchBar');
  contentPanelRef = viewChild<ElementRef>('contentPanel');

  // Effects for animations (defined below)
  private animateIndicator = effect(() => { /* ... */ });
  private animateContentPanel = effect(() => { /* ... */ });

  // Public methods
  setActiveSection(section: SectionType): void { /* ... */ }
  onDestinationSelected(destination: string): void { /* ... */ }
  handleSearch(): void { /* ... */ }
}
```

### Key Points:

1. **No NgModule** - Standalone component imports dependencies directly
2. **Injector injection** - Required for `afterNextRender` inside effects
3. **Signal-based state** - All reactive values are signals
4. **viewChild signals** - Modern DOM reference approach
5. **Private effects** - Effects as class properties, run automatically

---

## Template Syntax

### airbnb-search.html

```html
<div class="airbnb-search-container">
  <!-- Search Bar -->
  <div class="search-bar" #searchBar>
    <!-- Active Indicator Background -->
    <div class="active-indicator" #indicator></div>

    <!-- Where Section -->
    <button
      type="button"
      class="search-section"
      #whereSection
      [class.active]="activeSection() === 'where'"
      (click)="setActiveSection('where')">
      <div class="section-label">Where</div>
      <div class="section-value">
        {{ whereValue() || 'Search destinations' }}
      </div>
    </button>

    <!-- Divider -->
    <div class="section-divider"></div>

    <!-- When Section -->
    <button
      type="button"
      class="search-section"
      #whenSection
      [class.active]="activeSection() === 'when'"
      (click)="setActiveSection('when')">
      <div class="section-label">When</div>
      <div class="section-value">
        {{ whenValue() || 'Add dates' }}
      </div>
    </button>

    <!-- Divider -->
    <div class="section-divider"></div>

    <!-- Who Section -->
    <button
      type="button"
      class="search-section who-section"
      #whoSection
      [class.active]="activeSection() === 'who'"
      (click)="setActiveSection('who')">
      <div class="section-content">
        <div class="section-label">Who</div>
        <div class="section-value">
          {{ whoValue() || 'Add guests' }}
        </div>
      </div>

      <!-- Search Button -->
      <button
        type="button"
        class="search-btn"
        (click)="handleSearch(); $event.stopPropagation()">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
        <span>Search</span>
      </button>
    </button>
  </div>

  <!-- Content Panel - Conditional Rendering with @if -->
  @if (activeSection()) {
    <div class="content-panel" #contentPanel>
      @if (activeSection() === 'where') {
        <app-destination-suggestions (destinationSelected)="onDestinationSelected($event)" />
      }
      @if (activeSection() === 'when') {
        <app-date-picker />
      }
      @if (activeSection() === 'who') {
        <app-guest-picker />
      }
    </div>
  }
</div>
```

### Template Key Points:

1. **Template references** - `#searchBar`, `#indicator`, etc. bind to viewChild signals
2. **Signal reading in templates** - `activeSection()` called as function
3. **Property binding** - `[class.active]="..."` for dynamic classes
4. **Event binding** - `(click)="..."` for click handlers
5. **@if directive** - Modern Angular 17+ conditional rendering (replaces *ngIf)
6. **Interpolation** - `{{ whereValue() || 'default' }}` with fallback
7. **Event output** - `(destinationSelected)="onDestinationSelected($event)"`

---

## Component Styling

### airbnb-search.css

The CSS is identical to the vanilla version. Angular component styles are scoped by default.

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
}

/* CRITICAL: Initial hidden state for content panel */
.content-panel {
  position: absolute;
  top: calc(100% + 0.75rem);
  left: 0;
  width: fit-content;
  background: white;
  border-radius: 32px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.12), 0 4px 24px rgba(0, 0, 0, 0.08);
  z-index: 10;
  overflow: hidden;
  will-change: transform, opacity;

  /* Initial hidden state - prevents flash on first render */
  transform-origin: top center;
  opacity: 0;
  transform: translateY(-16px);
}

/* See vanilla guide for complete CSS */
```

**Angular-specific CSS notes:**
- Component styles are scoped (ViewEncapsulation.Emulated by default)
- `:host` selector targets component element itself
- No need for BEM or strict naming conventions
- Can use global styles in styles.css if needed

---

## TypeScript Implementation

### Complete Component Class

```typescript
import { Component, effect, ElementRef, signal, viewChild, afterNextRender, Injector, inject } from '@angular/core';
import { animate } from 'motion';
import { DestinationSuggestions } from './destination-suggestions/destination-suggestions';
import { DatePicker } from './date-picker/date-picker';
import { GuestPicker } from './guest-picker/guest-picker';

type SectionType = 'where' | 'when' | 'who' | null;

@Component({
  selector: 'app-airbnb-search',
  imports: [DestinationSuggestions, DatePicker, GuestPicker],
  templateUrl: './airbnb-search.html',
  styleUrl: './airbnb-search.css'
})
export class AirbnbSearch {
  // STEP 1: Inject Injector for afterNextRender
  private injector = inject(Injector);

  // STEP 2: Define state signals
  activeSection = signal<SectionType>(null);
  whereValue = signal('');
  whenValue = signal('');
  whoValue = signal('');

  // STEP 3: Define viewChild signals for DOM references
  whereRef = viewChild<ElementRef>('whereSection');
  whenRef = viewChild<ElementRef>('whenSection');
  whoRef = viewChild<ElementRef>('whoSection');
  indicatorRef = viewChild<ElementRef>('indicator');
  searchBarRef = viewChild<ElementRef>('searchBar');
  contentPanelRef = viewChild<ElementRef>('contentPanel');

  // STEP 4: Define effect for indicator animation
  private animateIndicator = effect(() => {
    const active = this.activeSection(); // Track signal
    const indicator = this.indicatorRef()?.nativeElement;
    const searchBar = this.searchBarRef()?.nativeElement;

    if (!indicator || !searchBar) return;

    if (!active) {
      // Hide indicator when nothing is active
      animate(
        indicator,
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

    // Get the reference to the active section
    let sectionRef: ElementRef | undefined;
    if (active === 'where') sectionRef = this.whereRef();
    else if (active === 'when') sectionRef = this.whenRef();
    else if (active === 'who') sectionRef = this.whoRef();

    if (!sectionRef) return;

    const section = sectionRef.nativeElement;
    const searchBarRect = searchBar.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();

    // Calculate position relative to search bar parent
    const left = sectionRect.left - searchBarRect.left;
    const top = sectionRect.top - searchBarRect.top;
    const width = sectionRect.width;
    const height = sectionRect.height;

    // Animate indicator to morph into the active section
    animate(
      indicator,
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
  });

  // STEP 5: Define effect for content panel animation
  private animateContentPanel = effect(() => {
    const active = this.activeSection(); // Track signal
    const contentPanel = this.contentPanelRef()?.nativeElement;
    const searchBar = this.searchBarRef()?.nativeElement;

    if (!contentPanel || !searchBar) return;

    // Get the active section to position panel below it
    let activeSectionRef: ElementRef | undefined;
    if (active === 'where') activeSectionRef = this.whereRef();
    else if (active === 'when') activeSectionRef = this.whenRef();
    else if (active === 'who') activeSectionRef = this.whoRef();

    if (!activeSectionRef) return;

    // CRITICAL: Schedule measurement AFTER Angular's render cycle
    // This ensures we measure the NEW component dimensions
    afterNextRender(() => {
      const activeElement = activeSectionRef!.nativeElement;
      const searchBarRect = searchBar.getBoundingClientRect();
      const sectionRect = activeElement.getBoundingClientRect();

      // Get search bar dimensions
      const searchBarWidth = searchBar.offsetWidth;

      // Get all child elements to animate
      const children = Array.from(contentPanel.children) as HTMLElement[];
      if (!children.length) return;

      // Temporarily reset styles to measure natural dimensions
      contentPanel.style.height = 'auto';
      contentPanel.style.width = 'fit-content';

      // Reset transforms (but keep opacity 0 to avoid flash)
      children.forEach(child => {
        child.style.transform = 'none';
      });

      // Force browser reflow to get accurate measurements
      const _ = contentPanel.offsetHeight;

      // Measure actual panel width
      const actualPanelWidth = contentPanel.offsetWidth;

      // Smart positioning based on active section
      let leftPosition: number;
      const searchBarPadding = 8;

      if (active === 'where') {
        // Where: Align with Where button (left side)
        leftPosition = sectionRect.left - searchBarRect.left;
      } else if (active === 'when') {
        // When: Center the calendar panel
        leftPosition = (searchBarWidth - actualPanelWidth) / 2;
      } else if (active === 'who') {
        // Who: Right-align with search bar
        leftPosition = searchBarWidth - actualPanelWidth - searchBarPadding;
      } else {
        // Fallback: align with active section
        leftPosition = sectionRect.left - searchBarRect.left;
      }

      // Ensure panel stays within bounds
      leftPosition = Math.max(
        searchBarPadding,
        Math.min(leftPosition, searchBarWidth - actualPanelWidth - searchBarPadding)
      );

      // Set initial state for children cross-fade
      children.forEach(child => {
        child.style.opacity = '0';
        child.style.transform = 'scale(0.96) translateY(8px)';
      });

      // PHASE 1: Animate panel container (top-down drop)
      animate(
        contentPanel,
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
      animate(
        children,
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
    }, { injector: this.injector });
  });

  // STEP 6: Public methods for template
  setActiveSection(section: SectionType): void {
    if (this.activeSection() === section) {
      // Toggle off if clicking the same section
      this.activeSection.set(null);
    } else {
      this.activeSection.set(section);
    }
  }

  onDestinationSelected(destination: string): void {
    this.whereValue.set(destination);
    this.activeSection.set(null);
  }

  handleSearch(): void {
    console.log('Search:', {
      where: this.whereValue(),
      when: this.whenValue(),
      who: this.whoValue()
    });
  }
}
```

### Code Walkthrough:

**Step 1: Injector**
- Required for `afterNextRender` inside effects
- Provides injection context for Angular's DI system

**Step 2: State Signals**
- `signal<Type>(initialValue)` creates reactive state
- `.set(value)` updates the signal
- `signal()` reads the value

**Step 3: ViewChild Signals**
- `viewChild<ElementRef>('templateRef')` creates reactive DOM reference
- Returns `undefined` until element is rendered
- Automatically updates when view changes

**Step 4-5: Effects**
- Run automatically when tracked signals change
- `this.activeSection()` call registers dependency
- Effect re-runs whenever activeSection changes
- Cleanup happens automatically

**Step 6: Public Methods**
- Called from template event bindings
- Update signals which trigger effects
- Simple imperative logic

---

## Animation with Motion.dev

### Installation

```bash
npm install motion
```

### Import

```typescript
import { animate } from 'motion';
```

### Usage in Angular

```typescript
// Basic animation
animate(
  element,              // DOM element (from viewChild)
  { opacity: 1, x: 0 }, // Target properties
  { duration: 0.45 }    // Options
);

// Spring physics animation
animate(
  element,
  { opacity: 1, scale: 1 },
  {
    duration: 0.45,
    type: 'spring',
    stiffness: 300,  // Higher = more rigid
    damping: 25,     // Higher = less bouncy
    mass: 0.8        // Lower = lighter/faster
  }
);

// Animate multiple elements
const children = Array.from(contentPanel.children) as HTMLElement[];
animate(
  children,  // Array of elements
  { opacity: 1, y: 0 },
  { duration: 0.45 }
);
```

### Spring Physics Parameters:

| Parameter | Description | Low Value | High Value |
|-----------|-------------|-----------|------------|
| **stiffness** | Spring tension | Slow, elastic | Fast, snappy |
| **damping** | Friction/resistance | More oscillation | Less bouncy |
| **mass** | Object weight | Light, fast | Heavy, slow |

**Our configuration:**
- `stiffness: 300` - Moderately snappy
- `damping: 25` - Slightly bouncy
- `mass: 0.8` - Light and responsive

---

## Angular Lifecycle & Timing

### Understanding afterNextRender

```typescript
afterNextRender(() => {
  // Code here runs AFTER Angular's change detection and DOM update
  const width = element.offsetWidth; // Safe to measure
}, { injector: this.injector });
```

**Why afterNextRender?**
```
User clicks button
    ↓
Signal updates: activeSection.set('when')
    ↓
Effect runs: animateContentPanel()
    ↓
Angular queues re-render (component marked dirty)
    ↓
afterNextRender schedules callback
    ↓
Angular runs change detection
    ↓
Angular updates DOM (renders DatePicker component)
    ↓
Angular commits changes to browser
    ↓
afterNextRender callback executes ✅
    ↓
Measurements are accurate! ✅
```

### Comparison: afterNextRender vs requestAnimationFrame

**Angular (afterNextRender):**
```typescript
effect(() => {
  const active = this.activeSection();
  if (!active) return;

  afterNextRender(() => {
    // Runs after Angular updates DOM
    const width = element.offsetWidth; // ✅ Accurate
  }, { injector: this.injector });
});
```

**Vanilla JS (requestAnimationFrame):**
```javascript
function showPanel(section) {
  activeSection = section;
  updateContent(section);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Runs after browser paints
      const width = element.offsetWidth; // ✅ Accurate
    });
  });
}
```

**Key Difference:**
- `afterNextRender` - Tied to Angular's lifecycle (more predictable)
- `requestAnimationFrame` - Tied to browser's paint cycle (more manual)

### Why Injector is Needed

```typescript
// Inside effect - needs explicit injector
private animate = effect(() => {
  afterNextRender(() => {
    // ...
  }, { injector: this.injector }); // ✅ Required
});

// Outside effect - automatic injection context
ngOnInit() {
  afterNextRender(() => {
    // ...
  }); // ✅ No injector needed (already in context)
}
```

**Reason:** Effects run outside Angular's normal injection context, so `afterNextRender` needs explicit injector to:
- Track the callback lifecycle
- Clean up when component destroys
- Access Angular's services if needed

---

## Reactive State Management

### Signal Patterns

**1. Writable Signals (State)**
```typescript
activeSection = signal<SectionType>(null);

// Update
this.activeSection.set('where');

// Read
const current = this.activeSection();
```

**2. Computed Signals (Derived State)**
```typescript
// Example: Computed value from multiple signals
isAnyActive = computed(() => this.activeSection() !== null);

// In template
@if (isAnyActive()) {
  <div>Something is active</div>
}
```

**3. Effects (Side Effects)**
```typescript
// Runs when activeSection changes
private logChanges = effect(() => {
  console.log('Active section:', this.activeSection());
});
```

### Signal Dependency Tracking

```typescript
private animate = effect(() => {
  // Reading these signals registers them as dependencies
  const active = this.activeSection();     // ✅ Tracked
  const indicator = this.indicatorRef();   // ✅ Tracked

  // This effect re-runs when activeSection OR indicatorRef changes

  // NOT tracked - just a function call
  this.doAnimation(active, indicator);     // ❌ Not tracked
});
```

**Important:** Only signal reads (function calls) within the effect callback are tracked.

### State Update Patterns

**✅ Good: Direct signal updates**
```typescript
setActiveSection(section: SectionType): void {
  if (this.activeSection() === section) {
    this.activeSection.set(null);  // Toggle off
  } else {
    this.activeSection.set(section); // Set new
  }
}
```

**❌ Bad: Mutating objects**
```typescript
// DON'T DO THIS
const config = this.config();
config.value = 'new'; // ❌ Mutation doesn't trigger updates
this.config.set(config); // ❌ Same reference, no change detected

// DO THIS
this.config.set({ ...this.config(), value: 'new' }); // ✅ New reference
```

### Effect Cleanup

```typescript
private subscription = effect((onCleanup) => {
  const id = setTimeout(() => {
    console.log('Delayed action');
  }, 1000);

  // Cleanup runs when effect re-runs or component destroys
  onCleanup(() => {
    clearTimeout(id);
  });
});
```

**Automatic cleanup for:**
- Component destruction
- Effect re-execution (dependencies changed)
- Manual effect destruction

---

## Angular-Specific Pitfalls

### 1. ❌ Missing Injector in afterNextRender

**Problem:**
```typescript
private animate = effect(() => {
  afterNextRender(() => {
    // Measurements...
  }); // ❌ ERROR: No injection context
});
```

**Error Message:**
```
NG0203: `afterNextRender` can only be used during construction, such as in a constructor or field initializer.
```

**Solution:**
```typescript
// Inject Injector at class level
private injector = inject(Injector);

private animate = effect(() => {
  afterNextRender(() => {
    // Measurements...
  }, { injector: this.injector }); // ✅ Works
});
```

### 2. ❌ Reading Signals Without Calling Them

**Problem:**
```typescript
// In template
<div>{{ activeSection }}</div>  <!-- ❌ Shows function, not value -->

// In TypeScript
const section = this.activeSection;  // ❌ Gets function reference
```

**Solution:**
```typescript
// In template
<div>{{ activeSection() }}</div>  <!-- ✅ Calls function, shows value -->

// In TypeScript
const section = this.activeSection();  // ✅ Calls function, gets value
```

### 3. ❌ Effect Running Before View Initialization

**Problem:**
```typescript
private animate = effect(() => {
  const element = this.elementRef()?.nativeElement;
  if (!element) return; // ❌ Always returns early on first run

  // Never reaches here initially...
});
```

**Why:** Effects run immediately, but viewChild signals are `undefined` until view initializes.

**Solution:** Guard clauses (already implemented correctly)
```typescript
private animate = effect(() => {
  const element = this.elementRef()?.nativeElement;
  if (!element) return; // ✅ Guard clause - effect will re-run when available

  // Safe to use element here
});
```

### 4. ❌ Hiding Panel in JavaScript (Causes Flash)

**Problem:**
```typescript
afterNextRender(() => {
  // ❌ This hides visible panel when switching sections!
  contentPanel.style.opacity = '0';
  contentPanel.style.transform = 'translateY(-16px)';

  // Then animate back to visible...
});
```

**Solution:** Set initial state in CSS only
```css
.content-panel {
  opacity: 0;
  transform: translateY(-16px);
}
```

```typescript
afterNextRender(() => {
  // ✅ Only animate TO visible, never manually hide
  animate(contentPanel, { opacity: 1, y: 0 }, { ... });
});
```

### 5. ❌ Measuring Before DOM Updates

**Problem:**
```typescript
effect(() => {
  const active = this.activeSection();
  const panel = this.contentPanelRef()?.nativeElement;

  // ❌ Measures OLD component before Angular updates to NEW component
  const width = panel.offsetWidth;
});
```

**Solution:** Use afterNextRender
```typescript
effect(() => {
  const active = this.activeSection();
  const panel = this.contentPanelRef()?.nativeElement;

  afterNextRender(() => {
    // ✅ Measures NEW component after Angular update
    const width = panel.offsetWidth;
  }, { injector: this.injector });
});
```

---

## Best Practices

### 1. Standalone Components

**✅ Modern Angular:**
```typescript
@Component({
  selector: 'app-search',
  imports: [DatePicker, GuestPicker], // Direct imports
  standalone: true // Default in Angular 17+
})
```

**❌ Old Angular:**
```typescript
// app.module.ts
@NgModule({
  declarations: [SearchComponent, DatePicker, GuestPicker],
  // ...boilerplate
})
```

### 2. OnPush Change Detection

```typescript
@Component({
  selector: 'app-search',
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ Add this
  // ...
})
```

**Benefits with Signals:**
- Signals automatically notify change detection
- OnPush skips unnecessary checks
- Better performance for large apps

### 3. Signal Naming Conventions

```typescript
// State signals - noun
activeSection = signal<SectionType>(null);
whereValue = signal('');

// Computed signals - adjective or "is/has" prefix
isActive = computed(() => this.activeSection() !== null);
hasValue = computed(() => this.whereValue().length > 0);

// ViewChild signals - suffix with "Ref"
indicatorRef = viewChild<ElementRef>('indicator');
contentPanelRef = viewChild<ElementRef>('contentPanel');
```

### 4. Type Safety

```typescript
// ✅ Define union types for state
type SectionType = 'where' | 'when' | 'who' | null;

// ✅ Generic viewChild
viewChild<ElementRef>('indicator'); // Type-safe nativeElement access

// ✅ Typed signal
signal<SectionType>(null); // TypeScript validates updates
```

### 5. Effect Organization

```typescript
export class Component {
  // Group related effects

  // UI Effects
  private animateIndicator = effect(() => { /* ... */ });
  private animateContentPanel = effect(() => { /* ... */ });

  // Data Effects
  private syncToBackend = effect(() => { /* ... */ });
  private updateAnalytics = effect(() => { /* ... */ });
}
```

### 6. Avoid Deep Signal Nesting

```typescript
// ❌ BAD: Nested signals
config = signal({
  section: signal('where'),  // ❌ Signal inside signal
  value: signal('')
});

// ✅ GOOD: Flat signals
activeSection = signal<SectionType>('where');
sectionValue = signal('');
```

### 7. Performance - will-change CSS

```css
/* Tell browser to optimize these properties */
.content-panel {
  will-change: transform, opacity;
}

.active-indicator {
  will-change: transform, opacity, width, height, left, top;
}
```

### 8. Accessibility

```html
<!-- ARIA attributes for screen readers -->
<button
  class="search-section"
  [attr.aria-expanded]="activeSection() === 'where'"
  aria-controls="contentPanel">
  Where
</button>

<div
  class="content-panel"
  id="contentPanel"
  role="region"
  [attr.aria-hidden]="!activeSection()">
  <!-- Content -->
</div>
```

---

## Comparison with Vanilla JS

### State Management

| Aspect | Vanilla JS | Angular Signals |
|--------|-----------|-----------------|
| **Declare state** | `let state = null;` | `state = signal(null);` |
| **Read state** | `state` | `state()` |
| **Update state** | `state = value;` | `state.set(value);` |
| **Reactivity** | Manual (event listeners) | Automatic (effects) |
| **Cleanup** | Manual (removeEventListener) | Automatic |

### DOM References

| Aspect | Vanilla JS | Angular |
|--------|-----------|---------|
| **Get element** | `document.getElementById('el')` | `viewChild<ElementRef>('el')` |
| **Availability** | Immediately (if exists) | Reactive (when rendered) |
| **Type safety** | ❌ No (returns Element \| null) | ✅ Yes (with generic) |
| **Reactivity** | ❌ No (static reference) | ✅ Yes (updates automatically) |

### Event Handling

**Vanilla JS:**
```javascript
button.addEventListener('click', () => {
  setActiveSection('where');
});

// Must cleanup
button.removeEventListener('click', handler);
```

**Angular:**
```html
<button (click)="setActiveSection('where')">Where</button>
```
- Automatic cleanup when component destroys
- Type-safe method calls
- Template syntax checks at compile time

### Conditional Rendering

**Vanilla JS:**
```javascript
if (activeSection) {
  contentPanel.style.display = 'block';
  contentPanel.innerHTML = getContent(activeSection);
} else {
  contentPanel.style.display = 'none';
}
```

**Angular:**
```html
@if (activeSection()) {
  <div class="content-panel">
    @if (activeSection() === 'where') {
      <app-destination-suggestions />
    }
  </div>
}
```
- Declarative (what, not how)
- Components automatically mounted/unmounted
- Lifecycle hooks handled automatically

### Timing & Measurements

**Vanilla JS:**
```javascript
updateContent(section);
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const width = element.offsetWidth; // After paint
  });
});
```

**Angular:**
```typescript
effect(() => {
  const section = this.activeSection();

  afterNextRender(() => {
    const width = element.offsetWidth; // After Angular update
  }, { injector: this.injector });
});
```

### Complete Example Comparison

**Vanilla JS (100+ lines):**
```javascript
// State
let activeSection = null;

// DOM references
const indicator = document.getElementById('indicator');
const sections = {
  where: document.getElementById('whereSection'),
  // ...
};

// Event listeners
sections.where.addEventListener('click', () => {
  setActiveSection('where');
});

// Manual reactivity
function setActiveSection(section) {
  activeSection = section;
  updateUI();
  animateIndicator();
  showContentPanel();
}

// Must cleanup
window.removeEventListener('click', outsideClickHandler);
```

**Angular (30 lines):**
```typescript
// State
activeSection = signal<SectionType>(null);

// DOM references (reactive)
indicatorRef = viewChild<ElementRef>('indicator');
whereRef = viewChild<ElementRef>('whereSection');

// Automatic reactivity
private animateIndicator = effect(() => {
  const active = this.activeSection(); // Tracks dependency
  // Animation logic...
});

// Template handles events & cleanup
setActiveSection(section: SectionType): void {
  this.activeSection.set(section);
}
```

### Advantages of Angular Approach

✅ **Less boilerplate**
- No manual DOM queries
- No manual event cleanup
- No manual reactivity tracking

✅ **Better type safety**
- TypeScript throughout
- Template type checking
- Generic viewChild references

✅ **Automatic cleanup**
- Effects destroy with component
- Event listeners auto-removed
- No memory leaks

✅ **Declarative**
- Template shows structure clearly
- Effects declare dependencies
- Less imperative code

✅ **Testable**
- Components are classes
- Signals can be mocked
- Templates can be unit tested

---

## Summary & Key Takeaways

### 🎯 Angular Core Patterns

1. **Signals for State** - Replace class properties with `signal()`
2. **Effects for Side Effects** - Replace lifecycle hooks with `effect()`
3. **viewChild for DOM** - Replace `@ViewChild` decorator with `viewChild()` signal
4. **afterNextRender for Timing** - Measure DOM after Angular's render cycle

### 📋 Implementation Checklist

- [ ] Use standalone components (no NgModules)
- [ ] Declare state as signals
- [ ] Use viewChild signals for DOM references
- [ ] Inject Injector for afterNextRender in effects
- [ ] Set initial CSS state to prevent flashes
- [ ] Use afterNextRender for post-render measurements
- [ ] Guard against undefined viewChild values
- [ ] Implement OnPush change detection
- [ ] Add ARIA attributes for accessibility

### 🔥 Critical Angular-Specific Points

1. **Always inject Injector** when using `afterNextRender` inside effects
2. **Read signals with ()** - `activeSection()` not `activeSection`
3. **Guard viewChild signals** - Check for `undefined` before accessing
4. **Never hide panel in JS** - Use CSS for initial hidden state
5. **Measure after render** - Use `afterNextRender` for accurate dimensions

### 💡 Angular Advantages

- **Automatic reactivity** - No manual tracking or updating
- **Type safety** - Full TypeScript support throughout
- **Declarative templates** - HTML describes UI, not imperative code
- **Automatic cleanup** - No memory leaks
- **Better testing** - Components are testable classes

### 🚀 Performance Optimizations

- OnPush change detection with signals
- `will-change` CSS properties
- Batch DOM reads in afterNextRender
- Prefer `transform` and `opacity` for animations
- Component-scoped styles (no global pollution)

---

## Resources

### Official Angular Docs
- **Signals Guide**: https://angular.dev/guide/signals
- **Effects**: https://angular.dev/guide/signals/effects
- **afterNextRender**: https://angular.dev/api/core/afterNextRender
- **Standalone Components**: https://angular.dev/guide/components/standalone

### Animation
- **Motion.dev**: https://motion.dev
- **Web Animations API**: https://developer.mozilla.org/en-US/Web/API/Web_Animations_API

### Performance
- **Angular Performance**: https://angular.dev/best-practices/runtime-performance
- **Change Detection**: https://angular.dev/best-practices/zone-pollution

---

**Created:** 2025-10-18
**Version:** 1.0
**Based on:** Implementation at `src/app/airbnb-search/airbnb-search.ts`
**Companion Guide:** `AIRBNB_SEARCH_ANIMATION_GUIDE.md` (Vanilla JS version)
