import { Component, output } from '@angular/core';

interface Destination {
  id: string;
  name: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-destination-suggestions',
  imports: [],
  templateUrl: './destination-suggestions.html',
  styleUrl: './destination-suggestions.css'
})
export class DestinationSuggestions {

  destinationSelected = output<string>();

  destinations: Destination[] = [
    {
      id: 'nearby',
      name: 'Nearby',
      description: "Find what's around you",
      icon: '✈️'
    },
    {
      id: 'bangkok',
      name: 'Bangkok, Thailand',
      description: 'For sights like Grand Palace',
      icon: '🏯'
    },
    {
      id: 'istanbul',
      name: 'Istanbul, Türkiye',
      description: 'For its bustling nightlife',
      icon: '🏛️'
    },
    {
      id: 'toronto',
      name: 'Toronto, Canada',
      description: 'For its top-notch dining',
      icon: '🏢'
    },
    {
      id: 'paris',
      name: 'Paris, France',
      description: 'For its stunning architecture',
      icon: '🗼'
    },
    {
      id: 'kolkata',
      name: 'Kolkata, India',
      description: 'For sights like Victoria Memorial',
      icon: '🕌'
    }
  ];

  selectDestination(destination: Destination): void {
    this.destinationSelected.emit(destination.name);
  }
}
