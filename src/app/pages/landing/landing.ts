import { Component, signal, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { effect, ViewChild, ElementRef } from '@angular/core'; // Asegúrate de importar effect
import confetti from 'canvas-confetti';

declare var Swal: any;

interface Message {
  role: 'user' | 'model';
  text: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss'],
})
export class LandingComponent implements OnDestroy {
  public cartService = inject(CartService);
  public auth = inject(AuthService);
  private musica = new Audio('assets/relaxshiva.mp');
  public musicaActiva = false;
  private route = inject(ActivatedRoute);

  // --- SEÑALES DE ESTADO ---
  showModal = signal(false);
  qty2 = signal(1);
  searchTerm = signal('');
  isOpen = signal(false);
  isLoading = signal(false);
  userInput: string = '';
  messages = signal<Message[]>([]);
  step = signal(0);
  pedidoTemporal = signal<any[]>([]);
  productoEnCurso = signal<any>(null);

  placeholderText = computed(() => {
    const s = this.step();
    if (s === 2) return 'Escribe la cantidad...';
    if (s === 3) return 'Escribe "pagar" o sigue comprando...'; // <--- NUEVO
    if (s === 4) return '¿Que deseas...';
    if (s === 5) return '¿Nequi o Efectivo?...';
    return 'Muchas gracias por elegirnos';
  });

  datosPedido = {
    direccion: '',
    pago: '',
  };

  products = [
    { id: 'bolis-oreo', name: 'Bolis Oreo 🍪', price: 2000, category: 'Bolis' },
    { id: 'bolis-fresa', name: 'Bolis Fresa 🍓', price: 2000, category: 'Bolis' },
    { id: 'bolis-choco', name: 'Bolis Chocolate 🍫', price: 2000, category: 'Bolis' },
    { id: 'bolis-mora', name: 'Bolis Mora 🍇', price: 1500, category: 'Bolis' },
    { id: 'bolis-mango', name: 'Bolis Mango 🥭', price: 1500, category: 'Bolis' },
    { id: 'bolis-sandia', name: 'Bolis Sandía 🍉', price: 1500, category: 'Bolis' },
    { id: 'papitas', name: 'Papitas BF 🍟', price: 2500, category: 'Pasabocas' },
    { id: 'platanos', name: 'Platanos BF 🥓', price: 2500, category: 'Pasabocas' },
    { id: 'tocineta', name: 'Tocineta BF 🥩', price: 2500, category: 'Pasabocas' },
  ];
  // 1. AÑADE ESTO AQUÍ (Justo debajo de products)
  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.products;
    return this.products.filter(
      (p) => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term),
    );
  });
  constructor() {
    this.route.queryParams.subscribe((params) => {
      if (params['openbot'] === 'true') {
        setTimeout(() => {
          this.isOpen.set(true);
          this.messages.set([
            {
              role: 'model',
              text: '¡Hola! ⚡ Proceso de **pago rápido** iniciado.\n\nToca el botón de abajo para recibir el QR de Nequi en WhatsApp.',
            },
          ]);
          // Seteamos datos automáticos para que no los pida
          this.datosPedido.direccion = 'PAGO_NEQUI_BRACAS';
          this.datosPedido.pago = 'Nequi';
          this.step.set(6); // Ir directo al botón de WhatsApp
        }, 1000);
      }
    });
    // Efecto para scroll automático
    effect(() => {
      this.messages(); // Monitorea cambios en los mensajes
      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-messages-container');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    });

    const activarAudio = () => {
      this.musica.loop = true;
      this.musica.volume = 0.4;
      this.musica
        .play()
        .then(() => {
          this.musicaActiva = true;
          document.removeEventListener('click', activarAudio);
        })
        .catch(() => console.log('Audio bloqueado'));
    };
    document.addEventListener('click', activarAudio, { once: true });
  }

  // --- LIMPIEZA DE AUDIO PARA EVITAR ECOS ---
  ngOnDestroy() {
    if (this.musica) {
      this.musica.pause();
      this.musica.src = '';
      this.musica.load();
    }
  }

  // --- FUNCIONES DEL CHAT ---

  formatText(text: string): string {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="btn-nequi-link">$1</a>')
      .replace(/\n/g, '<br>');
  }

  toggleChat() {
    this.isOpen.update((v) => !v);
    if (this.isOpen() && this.messages().length === 0) {
      this.messages.set([
        {
          role: 'model',
          text: '¡Hola! Soy BracasBot 🤖. ¿Qué deseas hacer? \n\n1️⃣ **Hacer un pedido** 🛵 \n2️⃣ **Pagar un pedido** 💸',
        },
      ]);
      this.step.set(1);
    }
  }

  // Mejora en el flujo de pasos del chat
  sendMessage() {
    const text = this.userInput.trim();
    if (!text) return;

    const lowerText = text.toLowerCase();
    // Guardamos el input original para mostrarlo en el chat
    this.messages.update((prev) => [...prev, { role: 'user', text }]);
    this.userInput = '';
    this.isLoading.set(true);

    setTimeout(() => {
      let response = '';
      const currentStep = this.step();

      switch (currentStep) {
        case 1: // Menú Inicial
          if (lowerText.includes('pagar') || lowerText.includes('2')) {
            // Si el usuario ya tiene cosas en el carrito, pedimos dirección
            if (this.cartService.items().length > 0) {
              response = '🛍️ ¡Excelente! **¿A qué dirección enviamos tu pedido?**';
              this.step.set(4);
            } else {
              response = '🛒 Tu carrito está vacío. ¡Toca un producto para empezar!';
            }
          } else {
            response = '🛵 ¡Dale! Selecciona los productos que desees de la lista.';
          }
          break;

        case 2: // Recibiendo Cantidad
          const cantidad = parseInt(text);
          if (!isNaN(cantidad) && cantidad > 0) {
            const prod = this.productoEnCurso();
            this.onAddToCart(prod.name, prod.price, prod.category, '', cantidad);

            response = `📥 Añadido **${cantidad}x ${prod.name}**.\n\n¿Quieres agregar algo más o deseas **pagar**?`;
            this.step.set(3); // Pausa lógica para decidir
          } else {
            response = '⚠️ Por favor, dime un número válido para la cantidad.';
          }
          break;

        case 3: // Decisión: ¿Seguir o Pagar?
          if (
            lowerText.includes('pagar') ||
            lowerText.includes('pago') ||
            lowerText.includes('2')
          ) {
            response = '🛍️ ¡Perfecto! **¿Cuál es tu dirección de entrega?**';
            this.step.set(4);
          } else {
            response = '🛵 ¡Claro! Sigue eligiendo. Cuando termines, solo escribe **"pagar"**.';
            this.step.set(1); // Volvemos al estado de espera de productos
          }
          break;

        case 4: // Recibiendo Dirección
          this.datosPedido.direccion = text;
          response = '✅ *¡Entendido!* ¿Cómo deseas pagar? \n\n💸 **Efectivo** \n💱 **Nequi**';
          this.step.set(5);
          break;

        case 5: // Recibiendo Método de Pago
          this.datosPedido.pago = text;
          const esNequi = lowerText.includes('nequi');
          const colorBoton = esNequi ? 'morado' : 'verde';

          response = `🎯 *¡TODO LISTO!*\n\n1️⃣ Toca el botón **${colorBoton}**\n2️⃣ Confirma el mensaje en WhatsApp.\n3️⃣ ¡Y listo! Estaremos procesando tu pedido.`;
          this.step.set(6); // Fin del flujo, muestra botones de WhatsApp
          break;

        default:
          response = '🤖 ¿En qué más puedo ayudarte? Si quieres empezar de nuevo escribe "hola".';
          if (lowerText.includes('hola')) this.step.set(1);
          break;
      }

      if (response) {
        this.messages.update((prev) => [...prev, { role: 'model', text: response }]);
      }
      this.isLoading.set(false);
    }, 800);
  }

  // --- NAVEGACIÓN Y SELECCIÓN ---
  scrollTo(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  seleccionarProductoDesdeBot(producto: any) {
    this.productoEnCurso.set(producto);
    this.messages.update((prev) => [
      ...prev,
      {
        role: 'model',
        text: `¿Cuántos **${producto.name}** quieres llevar?`,
      },
    ]);
    this.step.set(2);
  }

  // --- EFECTO DE CELEBRACIÓN ---
  dispararConfeti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      const colors = ['#ff6b00', '#ffbb00', '#ffffff'];

      confetti({
        ...defaults,
        particleCount,
        colors,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        colors,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }

  // --- INTEGRACIÓN WHATSAPP ---
  hacerPedidoWhatsApp() {
    this.isOpen.set(true);
    if (this.messages().length === 0) {
      this.toggleChat();
    } else {
      this.step.set(1);
    }
  }

  confirmarPedidoWhatsApp() {
    const telefono = '573218119383';
    const items = this.cartService.items();
    const direccion = this.datosPedido.direccion || 'Local / Por confirmar';
    const total = items.reduce((acc, i) => acc + i.price * (i.quantity || 1), 0);

    // ESTA LÍNEA ES LA CLAVE: Debe ser idéntica al Pago Express para que tu IA reaccione
    let mensaje = `*💱 PAGO_NEQUI_BRACAS* ⚡\n\n`;

    if (items.length > 0) {
      mensaje += `📦 *DETALLES DEL PEDIDO:*\n`;
      items.forEach((i) => {
        mensaje += `• ${i.name} x${i.quantity || 1}\n`;
      });
      mensaje += `\n💰 *TOTAL:* $${total.toLocaleString('es-CO')}\n`;
      mensaje += `📍 *ENTREGA:* ${direccion}\n\n`;
      mensaje += `*Solicito el QR de Nequi.*`; // Esta frase refuerza el comando de la IA
    } else {
      // Mensaje simplificado si por alguna razón no hay ítems
      mensaje += `🚀 *PAGO EXPRESS INICIADO*\n\nSolicito el QR de Nequi.`;
    }

    this.dispararConfeti();

    setTimeout(() => {
      window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
      this.resetearTodo();
    }, 1000);
  }

  confirmarPagoEnWhatsApp() {
    this.confirmarPedidoWhatsApp();
  }

  // --- UTILIDADES ---
  onAddToCart(name: string, price: any, category: string, image: string, quantity: any) {
    const qty = parseInt(quantity) || 1;
    this.cartService.addToCart({
      name,
      price: parseInt(price),
      category,
      imageUrl: image,
      quantity: qty,
    });

    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      icon: 'success',
      title: `¡${name} añadido!`,
      background: '#fff',
      color: '#000',
    });
  }

  resetearTodo() {
    this.cartService.clearCart();
    this.isOpen.set(false);
    this.step.set(0);
    this.messages.set([]);
    this.datosPedido = { direccion: '', pago: '' };
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!this.isOpen()) this.toggleChat();
  }
}
