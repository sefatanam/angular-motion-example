import { Component, effect, ElementRef, signal, viewChild, afterNextRender, ChangeDetectionStrategy } from '@angular/core';
import { animate } from 'motion';
import { DestinationSuggestions } from './destination-suggestions/destination-suggestions';
import { DatePicker } from './date-picker/date-picker';
import { GuestPicker } from './guest-picker/guest-picker';

type SectionType = 'where' | 'when' | 'who' | null;

@Component({
  selector: 'app-airbnb-search',
  imports: [DestinationSuggestions, DatePicker, GuestPicker],
  templateUrl: './airbnb-search.html',
  styleUrl: './airbnb-search.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AirbnbSearch {

  activeSection = signal<SectionType>(null);

  whereValue = signal('');
  whenValue = signal('');
  whoValue = signal('');

  // ViewChild references for DOM elements
  whereRef = viewChild<ElementRef>('whereSection');
  whenRef = viewChild<ElementRef>('whenSection');
  whoRef = viewChild<ElementRef>('whoSection');
  indicatorRef = viewChild<ElementRef>('indicator');
  searchBarRef = viewChild<ElementRef>('searchBar');
  contentPanelRef = viewChild<ElementRef>('contentPanel');

  // Indicator animation effect - morphs background to active section
  private animateIndicator = effect(() => {
    const active = this.activeSection();
    const indicator = this.indicatorRef()?.nativeElement;
    const searchBar = this.searchBarRef()?.nativeElement;

    if (!indicator || !searchBar) return;

    // Hide indicator when nothing is active
    if (!active) {
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

    // Get the active section element
    let sectionRef: ElementRef | undefined;
    if (active === 'where') sectionRef = this.whereRef();
    else if (active === 'when') sectionRef = this.whenRef();
    else if (active === 'who') sectionRef = this.whoRef();

    if (!sectionRef) return;

    const section = sectionRef.nativeElement;
    const searchBarRect = searchBar.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();

    // Calculate position relative to search bar
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

  // Content panel animation effect
  private animateContentPanel = effect(() => {
    const active = this.activeSection();
    const contentPanel = this.contentPanelRef()?.nativeElement;
    const searchBar = this.searchBarRef()?.nativeElement;

    if (!contentPanel || !searchBar) return;

    let activeSectionRef: ElementRef | undefined;
    if (active === 'where') activeSectionRef = this.whereRef();
    else if (active === 'when') activeSectionRef = this.whenRef();
    else if (active === 'who') activeSectionRef = this.whoRef();

    if (!activeSectionRef) return;

    // Wait for Angular to render the new component
    afterNextRender(() => {
      const children = Array.from(contentPanel.children) as HTMLElement[];
      if (!children.length) return;

      // STEP 1: Calculate where the panel should be positioned
      const position = this.calculatePanelPosition(
        active,
        contentPanel.offsetWidth,
        searchBar.offsetWidth
      );

      // STEP 2: Set children to hidden state (before animation)
      children.forEach(child => {
        child.style.opacity = '0';
        child.style.transform = 'scale(0.96) translateY(8px)';
      });

      // STEP 3: Animate panel into view (drop down + position horizontally)
      animate(
        contentPanel,
        {
          opacity: 1,
          x: position,
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

      // STEP 4: Animate children (cross-fade)
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

  // Helper: Calculate horizontal position for content panel
  private calculatePanelPosition(
    section: SectionType,
    panelWidth: number,
    searchBarWidth: number
  ): number {
    const padding = 8;

    // Determine position based on which section is active
    let position: number;

    if (section === 'where') {
      // Where: Align to left edge
      position = padding;
    } else if (section === 'when') {
      // When: Center the panel
      position = (searchBarWidth - panelWidth) / 2;
    } else if (section === 'who') {
      // Who: Align to right edge
      position = searchBarWidth - panelWidth - padding;
    } else {
      // Fallback: left edge
      position = padding;
    }

    // Keep panel within bounds
    return Math.max(
      padding,
      Math.min(position, searchBarWidth - panelWidth - padding)
    );
  }

  setActiveSection(section: SectionType): void {
    if (this.activeSection() === section) {
      // Toggle off if clicking the same section
      this.activeSection.set(null);
    } else {
      this.activeSection.set(section);
    }
  }

  onDestinationSelected(destination: string): void {
    xthis.whereValue.set(destination);
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
