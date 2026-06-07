import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AvatarRequest } from '../../Model/AvatarRequest.model';
import { AvatarResponse } from '../../Model/AvatarResponse.model';
import { EmotionType } from '../../Model/emotion.model';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  constructor(private http:HttpClient) { }

  sendMessage(request : AvatarRequest):Observable<AvatarResponse>{
    return this.http.post<AvatarResponse>("http://localhost:8080/avatar/chat",request)
  }
    // Store current emotion and broadcast to components
  private currentEmotion = new BehaviorSubject<EmotionType>('NEUTRAL');
  public emotion$ = this.currentEmotion.asObservable();

  // Trigger blink animation
  private blinkTrigger = new Subject<void>();
  public blink$ = this.blinkTrigger.asObservable();

  // Set avatar emotion
  setEmotion(emotion: EmotionType): void {
    this.currentEmotion.next(emotion);
  }

  // Get current emotion
  getEmotion(): EmotionType {
    return this.currentEmotion.value;
  }

  // Trigger a blink (from UI buttons)
  triggerBlink(): void {
    this.blinkTrigger.next();
  }

  // Map backend emotion response to avatar emotion type
  mapBackendEmotionToAvatar(sentiment?: string): EmotionType {
    if (!sentiment) return 'NEUTRAL';

    const sentimentLower = sentiment.toLowerCase();

    if (
      sentimentLower.includes('happy') ||
      sentimentLower.includes('recommend')
    ) {
      return 'HAPPY';
    }
    if (sentimentLower.includes('sad') || sentimentLower.includes('negative')) {
      return 'SAD';
    }
    if (
      sentimentLower.includes('confused') ||
      sentimentLower.includes('uncertain')
    ) {
      return 'CONFUSED';
    }
    if (
      sentimentLower.includes('excited') ||
      sentimentLower.includes('enthusiastic')
    ) {
      return 'EXCITED';
    }
    if (
      sentimentLower.includes('thinking') ||
      sentimentLower.includes('analyzing')
    ) {
      return 'THINKING';
    }
    return 'NEUTRAL';
  }

}
