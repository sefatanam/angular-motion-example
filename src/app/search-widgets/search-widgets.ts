import { Component, effect, ElementRef, signal, viewChild } from '@angular/core';
import { Recents } from "./recents/recents";
import { animate, AnimationOptions, SequenceOptions } from 'motion';


const animateAppRecents = (element: Element, animationOptions: any) => {

  animate(element, animationOptions, {
    duration: 0.22,
    type: 'spring',
    stiffness: 700,
    mass: 0.9,
    damping: 60
  })
}



@Component({
  selector: 'app-search-widgets',
  imports: [Recents],
  templateUrl: './search-widgets.html',
  styleUrl: './search-widgets.css'
})
export class SearchWidgets {

  recentRef = viewChild(Recents, { read: ElementRef })

  showRecents = signal(false)

  _ = effect(() => {
    let val = this.showRecents()
    const element = this.recentRef()?.nativeElement
    if (!element) return

    const animationOptions = {
      opacity: val ? 1 : 0,
      height: val ? 300 : 0
    }
    animateAppRecents(element, animationOptions)
  })


  onSearchFocus() {
    this.showRecents.set(true)
  }

  onSearchFocusOut() {
    this.showRecents.set(false)
  }
}
