import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http'; // Necesario para peticiones backend
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './chat-ai.component.html',
  styleUrls: ['./chat-ai.component.scss'],
})
export class ChatAiComponent {
  // Inyección de servicios utilizando el patrón inject de Angular moderno
  private cartService = inject(CartService);
  private http = inject(HttpClient);

  public isOpen = signal<boolean>(false);
  public isLoading = signal<boolean>(false);

  // Define la fase de la conversación: 'default' (menú básico) o 'tracking' (esperando ID de orden)
  public currentFlow = signal<string>('default');

  public messages = signal<Array<{ role: string; text: string }>>([
    {
      role: 'model',
      text: '¡Hola! Soy BracasBot 🍦 ¿En qué te puedo colaborar hoy? ¿Buscas bolis o pasabocas?',
    },
  ]);

  public userInput: string = '';

  // Controla la visibilidad de la interfaz del chat
  public toggleChat(): void {
    this.isOpen.update((value) => !value);
  }

  // Intercepta los clics en los botones de acción rápida
  public selectOption(optionType: string, label: string): void {
    if (this.isLoading()) return;

    // Registra visualmente la opción elegida por el usuario
    this.messages.update((prev) => [...prev, { role: 'user', text: label }]);
    this.isLoading.set(true);

    setTimeout(() => {
      let botResponse = '';

      if (optionType === 'hacer_pedido') {
        const cantidadItems = this.cartService.count();
        if (cantidadItems > 0) {
          botResponse = `¡Veo que tienes ${cantidadItems} productos en tu carrito! 🛒 Puedes proceder al pago directamente en la barra de navegación o continuar antojándote.`;
        } else {
          botResponse =
            '¡Excelente elección! Selecciona tus bolis gourmet o pasabocas favoritos en la tienda y agrégalos al carrito. 🛒';
        }
      } else if (optionType === 'pagar_pedido') {
        const total = this.cartService.totalPagar();
        if (total > 0) {
          botResponse = `Tu total actual a pagar es de **$${total.toLocaleString()}**. Procede al checkout de la web para gestionar tu pago de forma segura. 💳`;
        } else {
          botResponse =
            'El carrito está totalmente vacío. ¡Agrega tus antojos primero antes de pasar por caja! 🍦';
        }
      } else if (optionType === 'seguimiento_pedido') {
        botResponse =
          'Por favor, escríbeme el **ID o código de tu pedido** para consultar su estado en tiempo real de nuestra base de datos. 📍';
        this.currentFlow.set('tracking');
      }

      this.messages.update((prev) => [...prev, { role: 'model', text: botResponse }]);
      this.isLoading.set(false);
    }, 1000);
  }

  // Procesa el texto que el usuario digita de forma manual en el input de entrada
  public sendMessage(): void {
    if (!this.userInput.trim() || this.isLoading()) return;

    const textoUsuario = this.userInput;
    this.userInput = '';

    this.messages.update((prev) => [...prev, { role: 'user', text: textoUsuario }]);
    this.isLoading.set(true);

    setTimeout(() => {
      let botResponse = '';

      if (this.currentFlow() === 'tracking') {
        /* 
          ===================================================================
          📡 CONEXIÓN FUTURA CON TU BACKEND (JAVA / SPRING BOOT):
          Cuando tu API esté lista para recibir consultas, descomenta este bloque
          y reemplaza la URL con tu endpoint real de Bracasfood.
          ===================================================================
          
          const urlApi = `http://localhost:8080/api/pedidos/${textoUsuario}/progreso`;
          this.http.get<{ porcentaje: number }>(urlApi).subscribe({
            next: (data) => {
              this.messages.update(prev => [...prev, { 
                role: 'model', 
                text: `Buscando la orden **#${textoUsuario}**... Actualmente registra un progreso del **${data.porcentaje}%** en nuestra cocina. 🛵✨` 
              }]);
              this.isLoading.set(false);
            },
            error: () => {
              this.messages.update(prev => [...prev, { 
                role: 'model', 
                text: `❌ Lo siento, no logramos encontrar ninguna orden asociada al ID **#${textoUsuario}**. Revisa el número e intenta nuevamente.` 
              }]);
              this.isLoading.set(false);
            }
          });
          this.currentFlow.set('default');
          return;
        */

        // LÓGICA DE SIMULACIÓN ACTUAL (Coincidiendo con tu prueba unitaria: on_the_way = 66%)
        botResponse = `Buscando la orden **#${textoUsuario}**... Actualmente se encuentra **En Camino (66%)** y va directo a tu ubicación. 🛵✨`;
        this.currentFlow.set('default');
      } else {
        botResponse =
          '¡Delicioso! Contamos con los mejores bolis gourmet y pasabocas para tus eventos. ¿Te gustaría ver el menú completo?';
      }

      this.messages.update((prev) => [...prev, { role: 'model', text: botResponse }]);
      this.isLoading.set(false);
    }, 1500);
  }
}
