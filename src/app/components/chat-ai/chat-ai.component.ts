import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-ai.component.html',
  styleUrl: './chat-ai.component.scss',
})
export class ChatAiComponent {
  isOpen = signal(false);
  isLoading = signal(false);
  userInput = '';

  // Mensajes iniciales del asistente
  messages = signal<{ role: string; text: string }[]>([
    { role: 'model', text: '¡Hola! Soy el asistente de Bracasfood. ¿En qué puedo ayudarte hoy?' },
  ]);

  toggleChat() {
    this.isOpen.update((v) => !v);
  }

  async sendMessage() {
    // Si el input está vacío o ya está cargando, no hacer nada
    if (!this.userInput.trim() || this.isLoading()) return;

    const userText = this.userInput;

    // 1. Agregar el mensaje del usuario a la lista
    this.messages.update((m) => [...m, { role: 'user', text: userText }]);
    this.userInput = '';
    this.isLoading.set(true);

    try {
      // 2. URL de tu función en Google Cloud
      const API_URL = 'https://us-central1-tiend-app.cloudfunctions.net/createPreference';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Enviamos el texto del usuario en el cuerpo de la petición
        body: JSON.stringify({
          message: userText,
          // Si tu función de Mercado Pago requiere otros datos, agrégalos aquí
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }

      const data = await response.json();

      // 3. Procesar la respuesta de la función
      // Si la función devuelve una preferencia de pago, podrías mostrar el ID o el link.
      // Si lograste conectarla con Gemini, mostrará el texto de respuesta.
      const botReply =
        data.reply || data.response || 'He recibido tu mensaje en el servidor de Bracasfood.';

      this.messages.update((m) => [
        ...m,
        {
          role: 'model',
          text: botReply,
        },
      ]);
    } catch (error) {
      console.error('Error al conectar con Google Cloud:', error);
      this.messages.update((m) => [
        ...m,
        {
          role: 'model',
          text: 'Lo siento, tuve un problema al conectar con mis circuitos de Google Cloud. Verifica la consola.',
        },
      ]);
    } finally {
      this.isLoading.set(false);
    }
  }
}
