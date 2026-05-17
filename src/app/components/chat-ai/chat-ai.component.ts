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
  // 1. CONVERTIMOS LAS VARIABLES A SIGNALS MODERNAS
  public isOpen = signal<boolean>(false);
  public isLoading = signal<boolean>(false);
  public messages = signal<Array<{ role: string; text: string }>>([
    { role: 'model', text: '¡Hola! Soy BracasBot 🍦 ¿En qué te puedo colaborar hoy? ¿Buscas bolis o pasabocas?' }
  ]);

  public userInput: string = '';

  // Alterna la ventana del chat abierta o cerrada
  public toggleChat(): void {
    this.isOpen.update(value => !value);
  }

  // Simulación de envío de mensajes
  public sendMessage(): void {
    if (!this.userInput.trim() || this.isLoading()) return;

    const textoUsuario = this.userInput;
    this.userInput = ''; // Limpia el input de inmediato

    // Agregar el mensaje del usuario al arreglo de la Signal
    this.messages.update(prev => [...prev, { role: 'user', text: textoUsuario }]);
    
    // Activar el estado de carga (animación de los 3 puntitos)
    this.isLoading.set(true);

    // Simulador de respuesta automática de BracasBot después de 2 segundos
    setTimeout(() => {
      this.messages.update(prev => [...prev, { 
        role: 'model', 
        text: '¡Delicioso! Contamos con los mejores bolis gourmet y pasabocas para tus eventos. ¿Te gustaría ver el menú?' 
      }]);
      this.isLoading.set(false);
    }, 2000);
  }
}
