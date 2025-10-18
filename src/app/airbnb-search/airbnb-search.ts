import { Component, effect, ElementRef, signal, viewChild } from '@angular/core';
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

  activeSection = signal<SectionType>(null);

  whereValue = signal('');
  whenValue = signal('');
  whoValue = signal('');

  // ViewChild references for each section
  whereRef = viewChild<ElementRef>('whereSection');
  whenRef = viewChild<ElementRef>('whenSection');
  whoRef = viewChild<ElementRef>('whoSection');
  indicatorRef = viewChild<ElementRef>('indicator');
  searchBarRef = viewChild<ElementRef>('searchBar');
  contentPanelRef = viewChild<ElementRef>('contentPanel');

  // @REVIEW: Effect to animate the indicator when active section changes
  private animateIndicator = effect(() => {
    const active = this.activeSection();
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

  // @REVIEW: Effect to animate content panel with dimension morph and cross-fade
  // Inspired by dynamic-island animation approach
  private animateContentPanel = effect(() => {
    const active = this.activeSection();
    const contentPanel = this.contentPanelRef()?.nativeElement;
    const searchBar = this.searchBarRef()?.nativeElement;

    if (!contentPanel || !searchBar) return;

    // Get the active section to position panel below it
    let activeSectionRef: ElementRef | undefined;
    if (active === 'where') activeSectionRef = this.whereRef();
    else if (active === 'when') activeSectionRef = this.whenRef();
    else if (active === 'who') activeSectionRef = this.whoRef();

    if (!activeSectionRef) return;

    const activeElement = activeSectionRef.nativeElement;
    const searchBarRect = searchBar.getBoundingClientRect();
    const sectionRect = activeElement.getBoundingClientRect();

    // Get search bar dimensions
    const searchBarWidth = searchBar.offsetWidth;
    const panelMinWidth = 600; // From CSS

    // Calculate ideal left position aligned with active section
    let leftPosition = sectionRect.left - searchBarRect.left;

    // Ensure panel doesn't overflow beyond search bar's right edge
    const potentialRightEdge = leftPosition + panelMinWidth;
    if (potentialRightEdge > searchBarWidth) {
      // Right-align panel with search bar to prevent overflow
      leftPosition = searchBarWidth - panelMinWidth;
      // Ensure it doesn't go negative
      if (leftPosition < 0) leftPosition = 0;
    }

    // Get all child elements to animate
    const children = Array.from(contentPanel.children) as HTMLElement[];
    if (!children.length) return;

    // Store current dimensions before content changes
    const currentHeight = contentPanel.offsetHeight || 0;

    // Temporarily remove height constraint and make children visible to measure true height
    contentPanel.style.height = 'auto';
    children.forEach(child => {
      child.style.opacity = '1';
      child.style.transform = 'none';
    });

    // Measure the maximum natural height of all content
    const newHeight = Math.max(contentPanel.scrollHeight, contentPanel.offsetHeight);

    // Now set initial state for content cross-fade animation
    children.forEach(child => {
      child.style.opacity = '0';
      child.style.transform = 'scale(0.96) translateY(8px)';
    });

    // Animate panel dimensions and position (container morph - like dynamic-island)
    animate(
      contentPanel,
      {
        // height: [currentHeight, newHeight],
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

    // Animate content with cross-fade (content transition - like dynamic-island)
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
  });

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
