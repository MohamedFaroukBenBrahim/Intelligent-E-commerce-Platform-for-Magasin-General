import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Viseme {
  time: number; // seconds
  viseme: string;
}

@Injectable({ providedIn: 'root' })
export class LipSyncService {
  public viseme$ = new Subject<string>();

  private visemes: Viseme[] = [];
  private audio: HTMLAudioElement | null = null;
  private lastIndex = -1;

  constructor() {}

  start(visemes: Viseme[], audio: HTMLAudioElement | null) {
    this.stop();
    if (!visemes || visemes.length === 0 || !audio) return;

    this.visemes = visemes.slice().sort((a, b) => a.time - b.time);
    this.audio = audio;
    this.lastIndex = -1;

    audio.addEventListener('timeupdate', this.onTimeUpdate);
    audio.addEventListener('ended', this.stopBound);
  }

  private onTimeUpdate = () => {
    if (!this.audio) return;
    const t = this.audio.currentTime;
    // Find last viseme whose time <= t
    let idx = -1;
    for (let i = 0; i < this.visemes.length; i++) {
      if (this.visemes[i].time <= t) idx = i;
      else break;
    }

    if (idx !== -1 && idx !== this.lastIndex) {
      this.lastIndex = idx;
        console.log('🎬 Viseme emitted:', this.visemes[idx].viseme, 'at', t.toFixed(2) + 's');
        this.viseme$.next(this.visemes[idx].viseme);
    }
  };

  private stopBound = () => this.stop();

  stop() {
    if (this.audio) {
      this.audio.removeEventListener('timeupdate', this.onTimeUpdate);
      this.audio.removeEventListener('ended', this.stopBound);
    }
    this.audio = null;
    this.visemes = [];
    this.lastIndex = -1;
  }
}
