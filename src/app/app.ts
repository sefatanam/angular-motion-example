import { Component, signal } from '@angular/core';
import { DynamicIsland } from './dynamic-island/dynamic-island';

@Component({
  selector: 'app-root',
  imports: [DynamicIsland],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
