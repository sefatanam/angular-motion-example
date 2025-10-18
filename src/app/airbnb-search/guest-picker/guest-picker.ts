import { Component, signal } from '@angular/core';

interface GuestCategory {
  id: string;
  label: string;
  description: string;
  count: number;
  min: number;
  max: number;
}

@Component({
  selector: 'app-guest-picker',
  imports: [],
  templateUrl: './guest-picker.html',
  styleUrl: './guest-picker.css'
})
export class GuestPicker {

  adults = signal(0);
  children = signal(0);
  infants = signal(0);
  pets = signal(0);

  guestCategories: GuestCategory[] = [
    {
      id: 'adults',
      label: 'Adults',
      description: 'Age 13+',
      count: 0,
      min: 0,
      max: 16
    },
    {
      id: 'children',
      label: 'Children',
      description: 'Ages 2-12',
      count: 0,
      min: 0,
      max: 15
    },
    {
      id: 'infants',
      label: 'Infants',
      description: 'Under 2',
      count: 0,
      min: 0,
      max: 5
    },
    {
      id: 'pets',
      label: 'Pets',
      description: 'Bringing a service animal?',
      count: 0,
      min: 0,
      max: 5
    }
  ];

  getCount(categoryId: string): number {
    switch (categoryId) {
      case 'adults': return this.adults();
      case 'children': return this.children();
      case 'infants': return this.infants();
      case 'pets': return this.pets();
      default: return 0;
    }
  }

  increment(categoryId: string, max: number): void {
    const currentCount = this.getCount(categoryId);
    if (currentCount >= max) return;

    switch (categoryId) {
      case 'adults': this.adults.set(currentCount + 1); break;
      case 'children': this.children.set(currentCount + 1); break;
      case 'infants': this.infants.set(currentCount + 1); break;
      case 'pets': this.pets.set(currentCount + 1); break;
    }
  }

  decrement(categoryId: string, min: number): void {
    const currentCount = this.getCount(categoryId);
    if (currentCount <= min) return;

    switch (categoryId) {
      case 'adults': this.adults.set(currentCount - 1); break;
      case 'children': this.children.set(currentCount - 1); break;
      case 'infants': this.infants.set(currentCount - 1); break;
      case 'pets': this.pets.set(currentCount - 1); break;
    }
  }
}
