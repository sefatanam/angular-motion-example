import { Component, effect, signal } from '@angular/core';
import { animate, stagger } from "motion";

type IslandState = 'collapsed' | 'music' | 'timer' | 'call';

interface MusicState {
  song: string;
  artist: string;
  progress: number;
  isPlaying: boolean;
  currentTime: string;
  remainingTime: string;
  albumCover: string;
}

interface TimerState {
  time: string;
  label: string;
  isPaused: boolean;
}

interface CallState {
  callerName: string;
  callerLabel: string;
  callerImage: string;
  isIncoming: boolean;
}

const animateIslandTransition = (element: Element, state: IslandState): void => {
  const dimensions = {
    collapsed: { width: 126, height: 37, borderRadius: 33 },
    music: { width: 450, height: 200, borderRadius: 44 },
    timer: { width: 380, height: 80, borderRadius: 40 },
    call: { width: 450, height: 84, borderRadius: 42 }
  };

  const config = dimensions[state];
  animate(element, config, {
    duration: 0.55,
    type: 'spring',
    stiffness: 465,
    mass:0.75,
    damping: 57,
  });
};

const animateContentIn = (elements: NodeListOf<Element>): void => {
  animate(elements,
    { opacity: [1, 1], scale: [0.96, 1] },
    {
      duration: 0.3,
      delay: stagger(0.02),
      type: 'spring',
      stiffness: 400,
      damping: 40,
    }
  );
};

@Component({
  selector: 'dynamic-island',
  imports: [],
  templateUrl: './dynamic-island.html',
  styleUrl: './dynamic-island.css'
})
export class DynamicIsland {

  islandState = signal<IslandState>('collapsed');

  musicState = signal<MusicState>({
    song: 'Eyes Closed',
    artist: 'JISOO X ZAYN',
    progress: 45,
    isPlaying: true,
    currentTime: '1:19',
    remainingTime: '-0:16',
    albumCover: 'album_cover.png'
  });

  timer = signal<TimerState>({
    time: '1:48',
    label: 'Timer',
    isPaused: false
  });

  callState = signal<CallState>({
    callerName: 'Aga Orlova',
    callerLabel: 'iPhone',
    callerImage: '👤',
    isIncoming: true
  });

  private islandAnimationEffect = effect(() => {
    const state = this.islandState();
    const island = document.querySelector('.dynamic-island');
    if (!island) return;

    // Animate island container
    animateIslandTransition(island, state);
  });

  setIslandState(state: IslandState): void {
    this.islandState.set(state);
  }

  toggleMusicPlayback(): void {
    this.musicState.update(current => ({
      ...current,
      isPlaying: !current.isPlaying
    }));
  }

  toggleTimer(): void {
    this.timer.update(current => ({
      ...current,
      isPaused: !current.isPaused
    }));
  }

  cancelTimer(): void {
    this.setIslandState('collapsed');
  }

  answerCall(): void {
    this.callState.update(current => ({
      ...current,
      isIncoming: false
    }));
  }

  declineCall(): void {
    this.setIslandState('collapsed');
  }
}
