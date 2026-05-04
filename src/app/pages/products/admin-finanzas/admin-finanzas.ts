import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';

// 1. Interfaces para el tipado de Bracasfood
interface Insumo {
  nombre: string;
  costo: number;
}
interface Produccion {
  nombre: string;
  unidades: number;
}
interface Message {
  role: 'user' | 'model';
  text: string;
  isPaymentOption?: boolean; // Para mostrar botones de pago
}

@Component({
  selector: 'app-admin-finanzas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-finanzas.html',
  styleUrl: './admin-finanzas.scss',
})
export class AdminFinanzasComponent {
  // --- SERVICIOS ---
  public auth = inject(AuthService);
  public cartService = inject(CartService);
  private router = inject(Router);

  // --- ESTADO EDITABLE (SIGNALS) ---
  insumos = signal<Insumo[]>([{ nombre: 'Insumo', costo: 0 }]);
  produccion = signal<Produccion[]>([{ nombre: 'Producto final', unidades: 0 }]);
  gastoServicios = signal<number>(0);
  ventasTotalesDia = signal<number>(0);

  // --- ESTADO DEL CHATBOT ---
  isOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  userInput: string = '';
  messages = signal<Message[]>([]);
  metodoPagoSeleccionado: string = '';

  // --- CÁLCULOS DINÁMICOS AUTOMÁTICOS ---
  totalInsumos = computed(() =>
    this.insumos().reduce((acc: number, i: Insumo) => acc + (i.costo || 0), 0),
  );

  totalUnidades = computed(() =>
    this.produccion().reduce((acc: number, p: Produccion) => acc + (p.unidades || 0), 0),
  );

  costoTotalReal = computed(() => this.totalInsumos() + this.gastoServicios());

  costoPorUnidad = computed(() =>
    this.totalUnidades() > 0 ? this.costoTotalReal() / this.totalUnidades() : 0,
  );

  gananciaNetaDia = computed(() => this.ventasTotalesDia() - this.costoTotalReal());

  // --- ACCIONES DE FINANZAS ---
  agregarInsumo() {
    this.insumos.update((v) => [...v, { nombre: '', costo: 0 }]);
  }
  eliminarInsumo(index: number) {
    this.insumos.update((v) => v.filter((_, i) => i !== index));
  }
  agregarProducto() {
    this.produccion.update((v) => [...v, { nombre: '', unidades: 0 }]);
  }
  eliminarProducto(index: number) {
    this.produccion.update((v) => v.filter((_, i) => i !== index));
  }

  // --- LÓGICA INTELIGENTE DEL BRACASBOT ---
  toggleChat() {
    this.isOpen.update((v) => !v);
    if (this.isOpen() && this.messages().length === 0) {
      this.iniciarConversacionBot();
    }
  }

  iniciarConversacionBot() {
    const tieneProductos = this.cartService.count() > 0;

    if (tieneProductos) {
      this.messages.set([
        {
          role: 'model',
          text: '¡Hola! 🍦 Veo que ya tenés productos en tu carrito. ¿Deseas finalizar tu pedido y pagar ahora, o prefieres agregar algo más delicioso?',
          isPaymentOption: true,
        },
      ]);
    } else {
      this.messages.set([
        {
          role: 'model',
          text: '¡Bienvenido a Bracasfood! 🛒 ¿Qué se te antoja hoy? Podés cerrar el chat y mirar nuestros bolis y pasabocas.',
        },
      ]);
    }
  }

  // Manejador de respuestas del usuario y lógica de Nequi
  sendMessage() {
    const text = this.userInput.trim().toLowerCase();
    if (!text) return;

    this.messages.update((prev) => [...prev, { role: 'user', text: this.userInput }]);
    const currentInput = this.userInput;
    this.userInput = '';
    this.isLoading.set(true);

    setTimeout(() => {
      let botResponse = '';

      if (text.includes('pagar') || text.includes('finalizar')) {
        botResponse =
          '¡Excelente! 🚀 ¿Cómo prefieres pagar? Escribe "Nequi" o "Efectivo". Al elegir Nequi, te enviaremos el QR automáticamente.';
      } else if (text.includes('nequi')) {
        this.metodoPagoSeleccionado = 'NEQUI';
        botResponse =
          '¡Perfecto! 📲 Por favor, dime tu dirección. Al finalizar, te enviaré a WhatsApp y nuestra IA te pasará el QR de Nequi de inmediato con la keyword [REF: NEQUI-PAY].';
      } else if (text.includes('efectivo')) {
        this.metodoPagoSeleccionado = 'EFECTIVO';
        botResponse =
          'Entendido. 💵 Por favor, indícame tu dirección para coordinar la entrega y el cambio necesario.';
      } else if (text.length > 5 && this.metodoPagoSeleccionado !== '') {
        // Asumimos que envió la dirección
        botResponse =
          '¡Datos recibidos! 📍 Haz clic en el botón de abajo para confirmar en WhatsApp y recibir tu QR o detalles de entrega.';
      } else {
        botResponse = 'Recuerda que puedes decirme "Pagar" para procesar tu pedido de Bracasfood.';
      }

      this.messages.update((prev) => [...prev, { role: 'model', text: botResponse }]);
      this.isLoading.set(false);
    }, 1000);
  }

  // DISPARADOR PARA WHATSAPP CON KEYWORD
  irAWhatsapp(direccion: string) {
    const telefono = '3218119383'; // PONÉ ACÁ TU NÚMERO DE BRACASFOOD
    const keyword =
      this.metodoPagoSeleccionado === 'NEQUI' ? '[REF: NEQUI-PAY]' : '[REF: EFECTIVO]';
    const total = this.cartService.total(); // Suponiendo que tenés total() en tu CartService

    const mensaje =
      `¡Hola Bracasfood! 🍦 Quiero confirmar mi pedido.\n\n` +
      `📍 Dirección: ${direccion}\n` +
      `💰 Total: $${total}\n` +
      `💳 Método: ${this.metodoPagoSeleccionado}\n\n` +
      `${keyword}`;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }
}
