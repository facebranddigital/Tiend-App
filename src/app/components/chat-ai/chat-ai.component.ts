import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-ai.component.html',
  styleUrls: ['./chat-ai.component.scss']
})
export class ChatAiComponent {
  isOpen = signal(false);
  isLoading = signal(false);
  userInput = '';
  messages = signal<{role: string, text: string}[]>([
    {role: 'model', text: '¡Hola! Soy el asistente de Bracasfood. ¿En qué puedo ayudarte hoy?'}
  ]);

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  async sendMessage() {
    if (!this.userInput.trim()) return;

    const userText = this.userInput;
    this.messages.update(m => [...m, {role: 'user', text: userText}]);
    this.userInput = '';
    this.isLoading.set(true);

    // Aquí conectaremos con Gemini después
    setTimeout(() => {
      this.messages.update(m => [...m, {role: 'model', text: 'Recibido. Estoy configurando mis circuitos para responderte mejor...'}]);
      this.isLoading.set(false);
    }, 1000);
  }
}