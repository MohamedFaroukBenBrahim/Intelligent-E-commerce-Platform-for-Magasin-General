import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ChatbotComponent } from "./User/chatbot/chatbot.component";
import { AvatarComponent } from "./User/avatarAI/avatar/avatar.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatbotComponent, CommonModule, AvatarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
  showChatbot = false;
  showAvatar = false;

  // Edit this list to control where chatbot appears.
  private readonly chatbotAllowedRoutes = [
    '/',
    '/contact',
    '/aboutus',
    '/listProducts',
    '/listblog',
    '/recrutement'
  ];

  // Avatar only appears on product pages
  private readonly avatarAllowedRoutes = [
    '/product-detail',
    '/listProducts'
  ];

  constructor(private router: Router) {
    this.updateVisibility(this.router.url);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateVisibility(event.urlAfterRedirects);
      }
    });
  }

  private updateVisibility(url: string): void {
    const normalizedUrl = (url.split('?')[0] || '/').replace(/\/$/, '') || '/';
    
    // Update chatbot visibility
    this.showChatbot = this.chatbotAllowedRoutes.some((route) => {
      if (route === '/') {
        return normalizedUrl === '/';
      }
      return normalizedUrl === route || normalizedUrl.startsWith(route + '/');
    });

    // Update avatar visibility
    this.showAvatar = this.avatarAllowedRoutes.some((route) => {
      return normalizedUrl.startsWith(route);
    });
  }

  hideAvatar(): void {
    this.showAvatar = false;
  }
}
