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
    switch (s) {
      case 0:
        return 'Escribe "hola" para empezar...';
      case 1:
        return '¿Qué deseas hacer? (1 o 2)';
      case 2:
        return 'Escribe la cantidad...';
      case 3:
        return '¿Quieres algo más o "pagar"?';
      case 4:
        return 'Escribe tu dirección de entrega...'; // Aquí ya no dirá "¿Qué deseas?"
      case 5:
        return '¿Nequi o Efectivo?';
      case 6:
        return '¡Listo! Toca el botón para finalizar...';
      default:
        return 'Escribe un mensaje...';
    }
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
          this.datosPedido.direccion = 'PAGO EN PERSONA (LOCAL)';
          this.datosPedido.pago = 'Nequi';
          this.step.set(6); // Ir directo al botón de WhatsApp
        }, 1000);
      }
    });
    // Efecto para scroll automático corregido
    effect(() => {
      this.messages(); // Monitorea mensajes
      this.step(); // Monitorea el cambio a los botones de pago

      setTimeout(() => {
        // CAMBIO CLAVE: Buscamos '.chat-body' que es la clase real en tu HTML
        const chatContainer = document.querySelector('.chat-body');
        if (chatContainer) {
          chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 200); // 200ms para que alcancen a cargar los botones
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

            // LÓGICA MEJORADA:
            // Si el texto además de la cantidad dice "pagar", saltamos directo
            if (lowerText.includes('pagar')) {
              response = `📥 ¡Listo! **${cantidad}x ${prod.name}** añadidos.\n\n🛍️ **¿A qué dirección enviamos tu pedido?**`;
              this.step.set(4); // Salto directo a dirección
            } else {
              // Flujo normal si solo puso el número
              response = `📥 Añadido **${cantidad}x ${prod.name}**.\n\n¿Quieres agregar algo más o ya deseas **pagar**?`;
              this.step.set(3); // Espera decisión
            }
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
            const total = this.cartService
              .items()
              .reduce((acc, i) => acc + i.price * (i.quantity || 1), 0);

            // Si el carrito está vacío, no lo dejamos pasar al pago
            if (total === 0) {
              response = '🛒 Tu carrito está vacío. ¡Elige un producto antes de pagar!';
              this.step.set(1);
            } else {
              // Mensaje directo y profesional
              response = `🛍️ ¡Listo! Tu pedido suma **$${total.toLocaleString('es-CO')}**.\n\n¿A qué **dirección** enviamos tu pedido?`;
              this.step.set(4); // Salta directo a pedir dirección
            }
          } else {
            response = '🛵 ¡Vale! Sigue eligiendo. Cuando estés listo, escribe **"pagar"**.';
            this.step.set(1);
          }
          break;

        case 4: // Recibiendo Dirección
          this.datosPedido.direccion = text;
          const totalConfirmado = this.cartService
            .items()
            .reduce((acc, i) => acc + i.price * (i.quantity || 1), 0);

          response = `✅ *Dirección: ${text}*\n💰 *Total: $${totalConfirmado.toLocaleString('es-CO')}*\n\n¿Cómo deseas pagar? \n\n💸 **Efectivo** \n💱 **Nequi**`;
          this.step.set(5);
          break;

        case 5: // Recibiendo Método de Pago
          this.datosPedido.pago = text;
          const esNequi = lowerText.includes('nequi');
          const colorBoton = esNequi ? 'morado' : 'verde';

          response = `🎯 *¡TODO LISTO!*\n\n1️⃣ Toca el botón **${colorBoton}**\n2️⃣ Confirma el mensaje en WhatsApp.\n3️⃣ ¡Y listo! Estaremos procesando tu pedido.`;
          this.step.set(6);
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

  // ... termina tu sendMessage()
      // ... aquí termina tu sendMessage() { ... }

  // ESTA ES LA NUEVA FUNCIÓN INDEPENDIENTE
  procesarPagoDirecto() {
    const total = this.cartService.items().reduce((acc, i) => acc + (i.price * (i.quantity || 1)), 0);
    
    this.messages.update(prev => [...prev, 
      { role: 'user', text: 'Pagar' },
      { role: 'model', text: `🛍️ ¡Excelente! Tu pedido suma **$${total.toLocaleString('es-CO')}**.\n\n¿A qué **dirección** enviamos tu pedido?` }
    ]);
    
    this.step.set(4); 
  }

  // ... aquí puede seguir dispararConfeti() o las otras funciones

  dispararConfeti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);

      // Disparo izquierdo
      (confetti as any)({
        ...defaults,
        particleCount,
        colors: ['#ff6b00', '#ffbb00', '#ffffff'],
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      // Disparo derecho
      (confetti as any)({
        ...defaults,
        particleCount,
        colors: ['#ff6b00', '#ffbb00', '#ffffff'],
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }

  // --- INTEGRACIÓN WHATSAPP ---

  hacerPedidoWhatsApp() {
    this.isOpen.set(true);
    this.step.set(1);
    // Agregamos el mensaje inicial si el chat está vacío
    if (this.messages().length === 0) {
      this.messages.set([
        {
          role: 'model',
          text: '¡Hola! Soy BracasBot 🤖. ¿Qué deseas hacer? \n\n1️⃣ **Hacer un pedido** 🛵 \n2️⃣ **Pagar un pedido** 💸',
        },
      ]);
    }
  }

  confirmarPagoEnWhatsApp() {
    const telefono = '573218119383';
    const items = this.cartService.items();
    const total = items.reduce((acc, i) => acc + i.price * (i.quantity || 1), 0);

    // 1. EL BLOQUE DE ACTIVACIÓN (Exacto como lo reconoce tu IA)
    let mensaje = `💱PAGO_NEQUI_BRACAS ⚡\n`;
    mensaje += `🚀PAGO EXPRESS\n`;
    mensaje += `📥 Descarga el QR    🖨️ Escanealo en Nequi     📲 Envianos el comprobante\n\n`;

    // 2. LOS DETALLES (Sin emojis extra al inicio para no confundir a la IA)
    if (items.length > 0) {
      const lista = items.map((i) => `${i.name} x${i.quantity || 1}`).join(', ');
      mensaje += `PEDIDO: ${lista}\n`;
      mensaje += `TOTAL: $${total.toLocaleString('es-CO')}\n`;
      mensaje += `ENTREGA: ${this.datosPedido.direccion || 'Local'}\n\n`;
    }

    mensaje += `Solicito el QR de Nequi.`;

    this.dispararConfeti();

    setTimeout(() => {
      window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
      this.resetearTodo();
    }, 1000);
  }

  // Asegúrate de que la otra función también use este mismo comando si es Nequi
  confirmarPedidoWhatsApp() {
    if (this.datosPedido.pago.toLowerCase().includes('nequi')) {
      this.confirmarPagoEnWhatsApp();
    } else {
      // Lógica normal para Efectivo...
      const telefono = '573218119383';
      const items = this.cartService.items();
      const total = items.reduce((acc, i) => acc + i.price * (i.quantity || 1), 0);
      const lista = items.map((i) => `• ${i.name} x${i.quantity || 1}`).join('\n');

      const mensaje = `*📦 NUEVO PEDIDO - EFECTIVO*\n\n${lista}\n💰 *TOTAL:* $${total.toLocaleString('es-CO')}\n📍 *DIR:* ${this.datosPedido.direccion}\n💸 *PAGO:* Efectivo`;

      window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
      this.resetearTodo();
    }
    1000;
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

    // NOTIFICACIÓN ESTILO BRACAS FOOD
    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      icon: 'success',
      title: `¡Añadido!`,
      html: `
      <div style="display: flex; align-items: center; gap: 10px; text-align: left;">
        <img src="assets/bracasfoodlogo.jpeg" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #ff6b00;">
        <div>
          <b style="color: #ff6b00;">${qty}x</b> ${name}<br>
          <small style="color: #666;">Se sumó al carrito</small>
        </div>
      </div>
    `,
      background: '#fff',
      color: '#333',
      iconColor: '#ff6b00',
      didOpen: (toast: any) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
  }

  seleccionarProductoDesdeBot(prod: any) {
    this.productoEnCurso.set(prod);
    this.messages.update((prev) => [...prev, { role: 'model', text: `¿Cuántos *${prod.name}*?` }]);
    this.step.set(2);
  }

  toggleMusica() {
    this.musica.paused ? this.musica.play() : this.musica.pause();
    this.musicaActiva = !this.musica.paused;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  private resetearTodo() {
    this.cartService.clearCart(); // <--- Limpia el carrito real
    this.messages.set([]); // <--- Limpia el historial del chat
    this.step.set(0);
    this.isOpen.set(false);
    this.datosPedido = { direccion: '', pago: '' };
  }
}
