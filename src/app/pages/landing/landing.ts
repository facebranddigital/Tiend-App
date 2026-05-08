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
          this.datosPedido.direccion = 'PAGO EN PERSONA (LOCAL)';
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

  // ... termina tu sendMessage()

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
    const keyword = '💱PAGO_NEQUI_BRACAS';
    const items = this.cartService.items();

    let texto = '';

    if (items.length > 0) {
      // Si compró algo por la web, sí mostramos detalles
      const lista = items.map((i) => `• ${i.name} x${i.quantity}`).join('\n');
      const total = items.reduce((acc, i) => acc + i.price * (i.quantity || 1), 0);
      texto = `*${keyword}* 🚀\n\n📦 *PEDIDO:*\n${lista}\n💰 *TOTAL:* $${total.toLocaleString('es-CO')}\n📍 *ENTREGA:* En el local`;
    } else {
      // PAGO EXPRESS (Lo que usa tu mamá en la calle)
      texto = `*${keyword}* ⚡\n\🚀*PAGO EXPRESS*\n📥 Descarga el QR    🖨️ Escanealo en Nequi     📲 Envianos el comprobante\n\nSolicito el QR de Nequi.`;
    }

    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`, '_blank');
    this.resetearTodo();
  }

  confirmarPedidoWhatsApp() {
    const telefono = '573218119383';
    const items = this.cartService.items();
    const direccion = this.datosPedido.direccion || 'Local / Para llevar';
    const metodoPago = this.datosPedido.pago || 'No especificado';

    // Calculamos el total
    const total = items.reduce((acc, i) => acc + i.price * (i.quantity || 1), 0);

    // 1. Cabecera del mensaje
    let mensaje = `*📦 NUEVO PEDIDO - BRACASFOOD*\n\n`;

    // 2. Listado de productos
    if (items.length > 0) {
      mensaje += `*DETALLES:*\n`;
      items.forEach((i) => {
        mensaje += `• ${i.name} x${i.quantity || 1} ($${(i.price * (i.quantity || 1)).toLocaleString('es-CO')})\n`;
      });
      mensaje += `\n💰 *TOTAL A PAGAR:* $${total.toLocaleString('es-CO')}\n`;
    } else {
      mensaje += `⚡ *PAGO RÁPIDO (EXPRESS)*\n`;
    }

    // 3. Datos de entrega y pago
    mensaje += `\n📍 *ENTREGA:* ${direccion}`;
    mensaje += `\n💸 *MÉTODO DE PAGO:* ${metodoPago}`;

    if (metodoPago.toLowerCase().includes('nequi')) {
      mensaje += `\n\n--- \nSolicito el QR para realizar el pago por Nequi. 💱`;
    }

    // Abrir WhatsApp
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');

    // Limpiamos todo después de enviar
    this.resetearTodo();
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
    this.step.set(0);
    this.isOpen.set(false);
    this.datosPedido = { direccion: '', pago: '' };
  }
}
