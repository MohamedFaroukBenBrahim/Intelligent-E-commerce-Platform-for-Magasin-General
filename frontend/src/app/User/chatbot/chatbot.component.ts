import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatserviceService } from '../../Services/ChatBot/chatservice.service';
import { ChatMessage } from '../../Model/ChatMessage.model';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {
  isOpen = false;
  userInput = '';
  isLoading = false;
  selectedContext: ChatMessage['context'] = 'general';
  contextOptions: { label: string; value: ChatMessage['context'] }[] = [
    { label: ' General',  value: 'general'  },
    { label: ' Products', value: 'products' },
    { label: ' Jobs',     value: 'jobs'     },
  ];

  messages: ChatMessage[] = [
    {
      message: 'Hello! I am the MG Assistant. Select a topic below and ask me anything!',
      context: 'general',   // ← was ''
      role: 'assistant'
    }
  ];


  constructor(private chatbotService: ChatserviceService) {}

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text || this.isLoading) return;

    this.messages.push({ message: text, context: this.selectedContext, role: 'user' });
    this.userInput = '';
    this.isLoading = true;
    this.scrollToBottom();

    this.chatbotService.sendMessage(text, this.selectedContext).subscribe({
      next: (res: any) => {
        this.messages.push({
          message: res.response,
          context: this.selectedContext,
          role: 'assistant'
        });
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (err) => {
        const msg = err.status === 429
          ? 'I am a bit busy right now, please wait a moment and try again.'
          : 'Sorry, something went wrong. Please try again.';
          this.messages.push({ message: msg, context: 'general', role: 'assistant' });
        this.isLoading = false;
        this.scrollToBottom();
      }
    });
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const el = document.getElementById('chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}