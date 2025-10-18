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

  // @REVIEW: Effect to animate the indicator when active section changes
  private animateIndicator = effect(() => {
    const active = this.activeSection();
    const indicator = this.indicatorRef()?.nativeElement;
    const searchBar = this.searchBarRef()?.nativeElement;

    if (!indicator || !searchBar) return;

    if (!active) {
      // Hide indicator when nothing is active
      animate(indicator, { opacity: 0, scale: 0.95 }, { duration: 0.2 });
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

    // Calculate position relative to search bar
    const left = sectionRect.left - searchBarRect.left;
    const width = sectionRect.width;
    const height = sectionRect.height;

    // Animate indicator to match the active section
    animate(
      indicator,
      {
        opacity: 1,
        scale: 1,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`
      },
      {
        duration: 0.4,
        type: 'spring',
        stiffness: 400,
        damping: 30
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
