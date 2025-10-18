import { Component, signal } from '@angular/core';
import { SearchWidgets } from "./search-widgets/search-widgets";
import { DynamicIsland } from "./dynamic-island/dynamic-island";
import { AirbnbSearch } from "./airbnb-search/airbnb-search";

@Component({
  selector: 'app-root',
  imports: [SearchWidgets, DynamicIsland, AirbnbSearch],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
 export class App {
}
