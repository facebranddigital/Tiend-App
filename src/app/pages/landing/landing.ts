import { Component, signal, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { effect } from '@angular/core';
import confetti from 'canvas-confetti';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Message {
  role: 'user' | 'model';
  text: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss'],
})
export class LandingComponent implements OnInit, OnDestroy {
  public cartService = inject(CartService);
  public auth = inject(AuthService);
  private musica = new Audio('assets/relaxshiva.');
  public musicaActiva = false;
  private route = inject(ActivatedRoute);

  public isOpen = signal<boolean>(false);
  public step = signal<number>(0);
  public trackingActive = signal<boolean>(false);
  showModal = signal(false);
  qty2 = signal(0);
  searchTerm = signal('');
  isLoading = signal(false);
  userInput: string = '';
  messages = signal<Message[]>([]);
  pedidoTemporal = signal<any[]>([]);
  productoEnCurso = signal<any>(null);

  private readonly ADMIN_EMAILS: string[] = [
    'teveventaspasto@gmail.com',
    'eversozinho@gmail.com',
    'facebranddigital@gmail.com',
    'anaportilla143@gmail.com',
    'jbravo35@estudiantes.areandina.edu.co',
    'yjairobravo@gmail.com',
  ];

  public isCalculadoraAdminActive$: Observable<boolean> = this.auth.user$.pipe(
    map((user) => !!user?.email && this.ADMIN_EMAILS.includes(user.email.toLowerCase())),
  );

  // 🌟 NUEVO: Esto será TRUE únicamente para tu correo exacto
  public isEverAdminActive$: Observable<boolean> = this.auth.user$.pipe(
    map((user) => !!user?.email && user.email.toLowerCase() === 'eversozinho@gmail.com'),
  );

  placeholderText = computed(() => {
    const s = this.step();
    switch (s) {
      case 0:
        return 'Escribe "hola" para empezar...';
      case 1:
        return '¿Qué deseas hacer? (1, 2 o 3)';
      case 2:
        return 'Escribe la cantidad...';
      case 3:
        return '¿Quieres algo más o "pagar"?';
      case 4:
        return 'Escribe tu dirección de entrega...';
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
    { id: 'bolis-oreo', name: 'Bolis Oreo 🍪', price: 2000, category: 'Bolis', image: 'assets/bracasfoodbolis.webp' },
    { id: 'bolis-fresa', name: 'Bolis Fresa 🍓', price: 2000, category: 'Bolis', image: 'assets/bracasfoodbolis.webp' },
    { id: 'bolis-choco', name: 'Bolis Chocolate 🍫', price: 2000, category: 'Bolis', image: 'assets/bracasfoodbolis.webp' },
    { id: 'bolis-mora', name: 'Bolis Mora 🍇', price: 1500, category: 'Bolis', image: 'assets/bolismorados.webp' },
    { id: 'bolis-mango', name: 'Bolis Mango 🥭', price: 1500, category: 'Bolis', image: 'assets/bolismorados.webp' },
    { id: 'bolis-sandia', name: 'Bolis Sandía 🍉', price: 1500, category: 'Bolis', image: 'assets/bolismorados.webp' },
    { id: 'papitas', name: 'Papitas BF 🍟', price: 2500, category: 'Pasabocas', image: 'assets/papasbf.webp' },
    { id: 'platanos', name: 'Platanos BF 🥓', price: 2500, category: 'Pasabocas', image: 'assets/bracasfood2.webp' },
    { id: 'tocineta', name: 'Tocineta BF 🥩', price: 2500, category: 'Pasabocas', image: 'assets/tocinetabf.webp' },
  ];

  // 🏢 NUEVO: Catálogo exclusivo para C&E Schneider cuando tú inicias sesión
  productsSchneider = [
    { id: 'remodelacion', name: 'Remodelación de Interiores 🏗️', price: 150000, category: 'Construcción', image: 'assets/ceschneider.jpg' },
    { id: 'pintura', name: 'Pintura de Fachadas 🎨', price: 80000, category: 'Acabados', image: 'assets/ceschneider.jpg' },
    { id: 'diseno', name: 'Diseño de Planos 3D 📐', price: 350000, category: 'Planificación', image: 'assets/ceschneider.jpg' },
    { id: 'concreto', name: 'Vaciado de Placas 🧱', price: 500000, category: 'Estructura', image: 'assets/ceschneider.jpg' },
  ];

   // 🔄 CORREGIDO: Cambia los productos leyendo el método correcto del AuthService
  activeCatalog = computed(() => {
    // Usamos getCurrentUser() que es el método que sí existe en tu auth.service.ts
    const user = this.auth.getCurrentUser ? this.auth.getCurrentUser() : null; 
    const isEver = user?.email?.toLowerCase() === 'eversozinho@gmail.com';
    
    return isEver ? this.productsSchneider : this.products;
  });


  // 🔍 CORREGIDO: Ahora el buscador filtra dinámicamente sobre la lista que esté activa en pantalla
  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const currentCatalog = this.activeCatalog(); // Obtiene la lista actual de Bracas o Schneider
    
    if (!term) return currentCatalog;
    return currentCatalog.filter(
      (p) => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term),
    );
  });

  constructor() {
    effect(() => {
      this.messages();
      this.step();

      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-body');
        if (chatContainer) {
          chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 200);
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

  ngOnInit(): void {
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
          this.datosPedido.direccion = 'PAGO EN PERSONA (LOCAL)';
          this.datosPedido.pago = 'Nequi';
          this.step.set(6);
        }, 1000);
      }
    });
  }

  ngOnDestroy() {
    if (this.musica) {
      this.musica.pause();
      this.musica.src = '';
      this.musica.load();
    }
  }

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
          text: '¡Hola! Soy BracasBot 🤖. ¿Qué deseas hacer? \n\n1️⃣ **Hacer un pedido** 🛵 \n2️⃣ **Pagar un pedido** 💸 \n3️⃣ **Seguimiento de pedido** 📍',
        },
      ]);
      this.step.set(1);
    }
  }

  public selectOption(optionType: string, label: string): void {
    if (this.isLoading()) return;

    this.messages.update((prev) => [...prev, { role: 'user', text: label }]);
    this.isLoading.set(true);

    setTimeout(() => {
      let botResponse = '';

      if (optionType === 'hacer_pedido') {
        this.step.set(1);
        botResponse =
          '¡Excelente elección! Aquí abajo tienes nuestro menú dinámico. Presiona sobre cualquiera de ellos para sumarlo a tu orden. 🛒';
      } else if (optionType === 'pagar_pedido') {
        const total = this.cartService.totalPagar();
        if (total > 0) {
          botResponse = `Tu total a pagar es **$${total.toLocaleString('es-CO')}**. Puedes procesar tu pago directamente con el botón de confirmación en la caja. 💳`;
        } else {
          botResponse =
            'El carrito está vacío. ¡Agrega tus productos favoritos primero usando el menú interactivo para poder proceder al pago! 🍦';
        }
      } else if (optionType === 'seguimiento_pedido') {
        botResponse =
          'Por favor, escríbeme el **ID o código de tu pedido** (ejemplo: _BR-323_) para consultar su estado en tiempo real. 📍';
        this.trackingActive.set(true);
      }

      this.messages.update((prev) => [...prev, { role: 'model', text: botResponse }]);
      this.isLoading.set(false);
    }, 1000);
  }

  sendMessage() {
    const text = this.userInput.trim();
    if (!text) return;

    const lowerText = text.toLowerCase();
    this.messages.update((prev) => [...prev, { role: 'user', text }]);
    this.userInput = '';
    this.isLoading.set(true);

    setTimeout(() => {
      let response = '';

      if (this.trackingActive()) {
        response = `Buscando la orden **#${text}** en el sistema de Bracasfood... Actualmente se encuentra **En Camino (66%)** y va directo a tu ubicación. 🛵✨`;
        this.trackingActive.set(false);

        this.messages.update((prev) => [...prev, { role: 'model', text: response }]);
        this.isLoading.set(false);
        return;
      }

      const currentStep = this.step();

      switch (currentStep) {
        case 1: // Menú Inicial
          if (lowerText.includes('seguimiento') || lowerText.includes('3')) {
            response =
              'Por favor, escríbeme el **ID o código de tu pedido** (ejemplo: _BR-323_) para consultar su estado en tiempo real. 📍';
            this.trackingActive.set(true);
          } else if (lowerText.includes('pagar') || lowerText.includes('2')) {
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

            if (lowerText.includes('pagar')) {
              response = `📥 ¡Listo! **${cantidad}x ${prod.name}** añadidos.\n\n🛍️ **¿A qué dirección enviamos tu pedido?**`;
              this.step.set(4);
            } else {
              response = `📥 Añadido **${cantidad}x ${prod.name}**.\n\n¿Quieres agregar algo más o ya deseas **pagar**?`;
              this.step.set(3);
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
              .reduce((acc: number, i: any) => acc + i.price * (i.quantity || 1), 0);

            if (total === 0) {
              response = '🛒 Tu carrito está vacío. ¡Elige un producto antes de pagar!';
              this.step.set(1);
            } else {
              response = `🛍️ ¡Listo! Tu pedido suma **$${total.toLocaleString('es-CO')}**.\n\n¿A qué **dirección** enviamos tu pedido?`;
              this.step.set(4);
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
            .reduce((acc: number, i: any) => acc + i.price * (i.quantity || 1), 0);
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
    }, 1500);
  }

  procesarPagoDirecto() {
    const total = this.cartService
      .items()
      .reduce((acc: number, i: any) => acc + i.price * (i.quantity || 1), 0);

    this.messages.update((prev) => [
      ...prev,
      { role: 'user', text: 'Pagar' },
      {
        role: 'model',
        text: `🛍️ ¡Excelente! Tu pedido suma **$${total.toLocaleString('es-CO')}**.\n\n¿A qué **dirección** enviamos tu pedido?`,
      },
    ]);
    this.step.set(4);
  }

  dispararConfeti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        colors: ['#ff6b00', '#ffbb00', '#ffffff'],
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        colors: ['#ff6b00', '#ffbb00', '#ffffff'],
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }

  hacerPedidoWhatsApp() {
    this.isOpen.set(true);
    this.step.set(1);
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
    const total = items.reduce((acc: number, i: any) => acc + i.price * (i.quantity || 1), 0);

    const lineasProductos = items.map((i: any) => `• *${i.name}* (x${i.quantity || 1})`);
    const bloquesMensaje = [
      `💱 *PAGO NEQUI BRACAS* ⚡`,
      `🚀 *PAGO EXPRESS*`,
      `=========================`,
      `🛒 *DETALLE DEL PEDIDO:*`,
      ...lineasProductos,
      `=========================`,
      `💰 *TOTAL:* $${total.toLocaleString('es-CO')}`,
      `🛵 *ENTREGA:* ${this.datosPedido?.direccion || 'Recogida en Local'}`,
      `=========================`,
      `💬 _Solicito el QR de Nequi para proceder con el pago._`,
    ];

    const mensaje = bloquesMensaje.join('\n');
    const urlWhatsApp = `https://wa.me{telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
    this.dispararConfeti();
  }

  confirmarPedidoWhatsApp() {
    if (this.datosPedido.pago.toLowerCase().includes('nequi')) {
      this.confirmarPagoEnWhatsApp();
    } else {
      const telefono = '573218119383';
      const items = this.cartService.items();
      const total = items.reduce((acc: number, i: any) => acc + i.price * (i.quantity || 1), 0);
      const lista = items.map((i: any) => `• ${i.name} x${i.quantity || 1}`).join('\n');

      const mensaje = `*📦 NUEVO PEDIDO - EFECTIVO*\n\n${lista}\n\n💰 *TOTAL:* $${total.toLocaleString('es-CO')}\n📍 *DIR:* ${this.datosPedido.direccion || 'Recogida en Local'}`;
      const urlWhatsApp = `https://wa.me{telefono}?text=${encodeURIComponent(mensaje)}`;
      window.open(urlWhatsApp, '_blank');
      this.dispararConfeti();
    }
  }

  public onAddToCart(
    name: string,
    price: number,
    category: string,
    img: string,
    quantity: number | string,
  ): void {
    const qty = typeof quantity === 'string' ? parseInt(quantity) : quantity;
    const currentItems = [...this.cartService.items()];
    const exist = currentItems.find((i) => i.name === name);

    if (exist) {
      const baseQty = exist.quantity || 0;
      exist.quantity = baseQty + qty;
    } else {
      currentItems.push({ name, price, category, quantity: qty });
    }

    const cartSignal = this.cartService.items as any;
    if (typeof cartSignal.set === 'function') {
      cartSignal.set(currentItems);
    } else if (typeof cartSignal.update === 'function') {
      cartSignal.update(() => currentItems);
    }
  }

  public seleccionarProductoDesdeBot(prod: any): void {
    this.productoEnCurso.set(prod);
    this.messages.update((prev) => [...prev, { role: 'user', text: `Añadir ${prod.name}` }]);
    this.onAddToCart(prod.name, prod.price, prod.category, '', 1);

    this.messages.update((prev) => [
      ...prev,
      {
        role: 'model',
        text: `📥 Añadido **1x ${prod.name}** al pedido.\n\n¿Quieres agregar algo más o ya deseas **pagar**?`,
      },
    ]);
    this.step.set(3);
  }

  public scrollTo(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  public scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
