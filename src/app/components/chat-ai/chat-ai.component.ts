import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http'; 
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service'; // 👈 IMPORTACIÓN AGREGADA
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './chat-ai.component.html',
  styleUrls: ['./chat-ai.component.scss'],
})
export class ChatAiComponent implements OnInit, OnDestroy {
  // Inyección de servicios utilizando el patrón inject de Angular moderno
  private cartService = inject(CartService);
  private http = inject(HttpClient);
  private authService = inject(AuthService); // 👈 INYECCIÓN AGREGADA

  public isOpen = signal<boolean>(false);
  public isLoading = signal<boolean>(false);

  // Define la fase de la conversación: 'default' (menú básico) o 'tracking' (esperando ID de orden)
  public currentFlow = signal<string>('default');

  // 🔮 Variable expuesta para el Pipe Async del HTML si la necesitas
  public isEverAdminActive$ = this.authService.isEverAdminActive$;
  private authSubscription!: Subscription;
  private isEverAdmin: boolean = false;

  // Inicialización de la cola de mensajes
  public messages = signal<Array<{ role: string; text: string }>>([]);

  public userInput: string = '';

  // 🌟 ESCUCHA DINÁMICA DEL ROL DEL USUARIO AL INICIALIZAR EL COMPONENTE
  ngOnInit(): void {
    this.authSubscription = this.isEverAdminActive$.subscribe(isEver => {
      this.isEverAdmin = isEver;
      
      // Reseteamos el mensaje de bienvenida de acuerdo al correo activo
      if (isEver) {
        this.messages.set([
          {
            role: 'model',
            text: '⚡ [CONSOLA SCHNEIDERBOT INTERACTIVA] Bienvenido Ever. ¿Qué módulo técnico, bitácora de obra o balance de finanzas deseas auditar hoy?',
          }
        ]);
      } else {
        this.messages.set([
          {
            role: 'model',
            text: '¡Hola! Soy BracasBot 🍦 ¿En qué te puedo colaborar hoy? ¿Buscas bolis o pasabocas?',
          }
        ]);
      }
    });
  }

  // Limpieza de memoria al destruir el componente
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

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

      // 🔮 RESPUESTAS DE CONSOLA EXCLUSIVAS PARA EVER
      if (this.isEverAdmin) {
        if (optionType === 'hacer_pedido') {
          botResponse = 'Accediendo de forma segura al registro global de materiales e inventario técnico de obra blanca... 📂';
        } else if (optionType === 'pagar_pedido') {
          botResponse = 'Compilando base de datos de costos fijos y estados financieros. Procede al módulo de balances para auditar el proyecto. 📊';
        } else if (optionType === 'seguimiento_pedido') {
          botResponse = 'Por favor, digita el número de contrato o ID del proyecto de remodelación para recuperar la hoja de ruta física. 📍';
          this.currentFlow.set('tracking');
        }
      } 
      // 🟠 RESPUESTAS TRADICIONALES DE COMIDA PARA EL PÚBLICO
      else {
        if (optionType === 'hacer_pedido') {
          const cantidadItems = this.cartService.count();
          if (cantidadItems > 0) {
            botResponse = `¡Veo que tienes ${cantidadItems} productos en tu carrito! 🛒 Puedes proceder al pago directamente en la barra de navegación o continuar antojándote.`;
          } else {
            botResponse = '¡Excelente elección! Selecciona tus bolis gourmet o pasabocas favoritos en la tienda y agrégalos al carrito. 🛒';
          }
        } else if (optionType === 'pagar_pedido') {
          const total = this.cartService.totalPagar();
          if (total > 0) {
            botResponse = `Tu total actual a pagar es de **$${total.toLocaleString()}**. Procede al checkout de la web para gestionar tu pago de forma segura. 💳`;
          } else {
            botResponse = 'El carrito está totalmente vacío. ¡Agrega tus antojos primero antes de pasar por caja! 🍦';
          }
        } else if (optionType === 'seguimiento_pedido') {
          botResponse = 'Por favor, escríbeme el **ID o código de tu pedido** para consultar su estado en tiempo real de nuestra base de datos. 📍';
          this.currentFlow.set('tracking');
        }
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
        if (this.isEverAdmin) {
          botResponse = `Consultando el estado técnico de la obra **#${textoUsuario}** en la base de datos... Actualmente registra acabados al **66% (En progreso)**. 🧱✨`;
        } else {
          botResponse = `Buscando la orden **#${textoUsuario}**... Actualmente se encuentra **En Camino (66%)** y va directo a tu ubicación. 🛵✨`;
        }
        this.currentFlow.set('default');
      } else {
        if (this.isEverAdmin) {
          botResponse = 'Comando interactivo recibido. Actualmente procesando consultas del núcleo de C&E Schneider. ¿Deseas asistencia remota con las finanzas?';
        } else {
          botResponse = '¡Delicioso! Contamos con los mejores bolis gourmet y pasabocas para tus eventos. ¿Te gustaría ver el menú completo?';
        }
      }

      this.messages.update((prev) => [...prev, { role: 'model', text: botResponse }]);
      this.isLoading.set(false);
    }, 1500);
  }
}
