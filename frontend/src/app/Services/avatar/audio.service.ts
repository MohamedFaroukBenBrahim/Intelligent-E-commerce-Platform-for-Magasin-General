import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private audio: HTMLAudioElement | null = null;
  public time$ = new BehaviorSubject<number>(0);
  public ended$ = new Subject<void>();

  constructor() {}

  playUrl(url: string): HTMLAudioElement {
    if (this.audio) {
      this.stop();
    }

    this.audio = new Audio(url);
    this.audio.crossOrigin = 'anonymous';

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) this.time$.next(this.audio.currentTime);
    });

    this.audio.addEventListener('ended', () => {
      this.ended$.next();
    });

    this.audio.play().catch((err) => console.warn('Audio play failed', err));
    return this.audio;
  }

  stop(): void {
    if (!this.audio) return;
    try {
      this.audio.pause();
      this.audio.currentTime = 0;
    } catch (e) {
      /* ignore */
    }
    this.audio = null;
    this.time$.next(0);
  }

  getAudioElement(): HTMLAudioElement | null {
    return this.audio;
  }
}
