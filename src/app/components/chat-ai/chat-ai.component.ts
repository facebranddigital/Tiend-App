import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importante para leer lo que escriben

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-ai.component.html',
  styleUrls: ['./chat-ai.component.scss'],
})
export class ChatAiComponent {
  isOpen = signal(false); // Controla si el chat se ve o no
  userInput = '';
  messages = [{ role: 'bot', text: '¡Hola! Soy BracasBot. ¿En qué puedo ayudarte hoy?' }];

  toggleChat() {
    this.isOpen.update((v) => !v);
  }

  async sendMessage() {
    if (!this.userInput.trim()) return;

    // 1. Añadimos el mensaje del usuario
    this.messages.push({ role: 'user', text: this.userInput });
    const userQuery = this.userInput;
    this.userInput = '';

    // 2. Aquí es donde conectaremos con la IA (Gemini)
    // Por ahora, pongamos una respuesta automática
    setTimeout(() => {
      this.messages.push({
        role: 'bot',
        text: '¡Claro! Estamos preparando los mejores Bolis para ti. ¿Quieres que te envíe el catálogo?',
      });
    }, 1000);
  }
}
