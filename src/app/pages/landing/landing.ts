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
  private musica = new Audio('assets/relaxshiva.mp3');
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

  public isEverAdminActive$: Observable<boolean> = this.auth.user$.pipe(
    map((user) => !!user?.email && user.email.toLowerCase().startsWith('everso')),
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

  // ✅ Catálogo con orden exacto y cantidad inicial en 1
  products = [
    { id: 'bolis-naturales', name: 'Bolis Naturales 🍇', price: 1500, category: 'Bolis', image: 'assets/bolismorados.png', quantity: 1 },
    { id: 'bolis-leche', name: 'Bolis de Leche 🥛', price: 2000, category: 'Bolis', image: 'assets/bracasfoodbolis.webp', quantity: 1 },
    { id: 'platanos', name: 'Platanos BF 🥓', price: 2500, category: 'Pasabocas', image: 'assets/bracasfood2.webp', quantity: 1 },
    { id: 'papitas', name: 'Papitas BF 🍟', price: 2500, category: 'Pasabocas', image: 'assets/papasbf.png', quantity: 1 },
    { id: 'tocineta', name: 'Tocineta BF 🥩', price: 2500, category: 'Pasabocas', image: 'assets/tocinetabf.png', quantity: 1 },
  ];

  productsSchneider = [
    { id: 'sch-1', name: '1️⃣ Molduras e Iluminación en Drywall 💡', price: 45000, category: 'Techos', image: 'assets/ceschneider.jpg', quantity: 1 },
    { id: 'sch-2', name: '2️⃣ Pisos y Enchapados Cerámicos 🧱', price: 65000, category: 'Pisos', image: 'assets/ceschneider.jpg', quantity: 1 },
    { id: 'sch-3', name: '3️⃣ Pintura General e Impermeabilización 🎨', price: 25000, category: 'Paredes', image: 'assets/ceschneider.jpg', quantity: 1 },
    { id: 'sch-4', name: '4️⃣ Estuco y Alisado de Muros ✨', price: 18000, category: 'Paredes', image: 'assets/ceschneider.jpg', quantity: 1 },
    { id: 'sch-5', name: '5️⃣ Instalación de Aparatos Sanitarios y Grifería 🚰', price: 80000, category: 'Baños', image: 'assets/ceschneider.jpg', quantity: 1 },
  ];

  activeCatalog = computed(() => {
    const user = this.auth.getCurrentUser ? this.auth.getCurrentUser() : null; 
    const isEver = user?.email?.toLowerCase().startsWith('everso');
    return isEver ? this.productsSchneider : this.products;
  });

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const currentCatalog = this.activeCatalog();
    if (!term) return currentCatalog;
    return currentCatalog.filter(
      (p) => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term),
    );
  });

  themeColors = computed(() => {
    const user = this.auth.getCurrentUser ? this.auth.getCurrentUser() : null;
    const isSchneider = user?.email?.toLowerCase().startsWith('everso');

    if (isSchneider) {
      return {
        backgroundChat: '#15141b',
        headerBot: '#000000',
        bubbleModel: '#221f2d',
        bubbleUser: '#b020a1',
        textModel: '#ffffff',
        textUser: '#ffffff'
      };
    } else {
      return {
        backgroundChat: '#ffffff',
        headerBot: '#000000',
        bubbleModel: '#f1f1f1',
        bubbleUser: '#522d80',
        textModel: '#333333',
        textUser: '#ffffff'
      };
    }
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
      const user = this.auth.getCurrentUser ? this.auth.getCurrentUser() : null;
      const isSchneider = user?.email?.toLowerCase().startsWith('everso');

      if (isSchneider) {
        this.messages.set([
          {
            role: 'model',
            text: '¡Hola! Soy **SchneiderBot** 🤖, tu asistente virtual de **Remodelaciones Schneider**. \n\n¿Qué deseas hacer hoy? \n\n1️⃣ **Cotizar acabados u Obra Blanca** 🏗️ \n2️⃣ **Gestionar un pago de proyecto** 💸 \n3️⃣ **Consultar estado de mi obra** 📍',
          },
        ]);
      } else {
        this.messages.set([
          {
            role: 'model',
            text: '¡Hola! Soy BracasBot 🤖. ¿Qué deseas hacer? \n\n1️⃣ **Hacer un pedido** 🛵 \n2️⃣ **Pagar un pedido** 💸 \n3️⃣ **Seguimiento de pedido** 📍',
          },
        ]);
      }
      this.step.set(1);
    }
  }

  public selectOption(optionType: string, label: string): void {
    if (this.isLoading()) return;

    this.messages.update((prev) => [...prev, { role: 'user', text: label }]);
    this.isLoading.set(true);

    setTimeout(() => {
      let botResponse = '';
      const user = this.auth.getCurrentUser ? this.auth.getCurrentUser() : null;
      const isSchneider = user?.email?.toLowerCase().startsWith('everso');

      if (optionType === 'hacer_pedido') {
        this.step.set(1);
        botResponse = isSchneider
          ? '¡Excelente elección! Aquí abajo tienes nuestro catálogo de **Servicios y Obras**. Presiona sobre cualquiera de ellos para cotizarlo o sumarlo a tu orden de trabajo. 🏗️📐'
          : '¡Excelente elección! Aquí abajo tienes nuestro menú dinámico. Presiona sobre cualquiera de ellos para sumarlo a tu orden. 🛒';
      } else if (optionType === 'pagar_pedido') {
        const total = this.cartService.totalPagar();
        if (total > 0) {
          botResponse = isSchneider
            ? `El valor estimado de tus servicios a contratar es **$${total.toLocaleString('es-CO')}**. Puedes proceder a confirmar los detalles de la obra en el botón de la caja. 💳`
            : `Tu total a pagar es **$${total.toLocaleString('es-CO')}**. Puedes procesar tu pago directamente con el botón de confirmación en la caja. 💳`;
          this.step.set(5);
        } else {
          botResponse = isSchneider
            ? 'La lista de cotización está vacía. ¡Selecciona un servicio de remodelación o ingeniería primero usando el catálogo interactivo! 🏗️'
            : 'El carrito está vacío. ¡Agrega tus productos favoritos primero usando el menú interactivo para poder proceder al pago! 🍦';
          this.step.set(1);
        }
      } else if (optionType === 'seguimiento_pedido') {
        botResponse = isSchneider
          ? 'Por favor, escríbeme el **ID de radicado u orden de obra** (ejemplo: _CS-842_) para consultar el estado del proyecto en tiempo real. 📍'
          : 'Por favor, escríbeme el **ID o código de tu pedido** (ejemplo: _BR-323_) para consultar su estado en tiempo real. 📍';
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
      const user = this.auth.getCurrentUser ? this.auth.getCurrentUser() : null;
      const isSchneider = user?.email?.toLowerCase().startsWith('everso');

      if (this.trackingActive()) {
        response = isSchneider
          ? `Buscando el radicado de obra **#${text}** en el sistema de C&E Schneider... Actualmente se encuentra en **Fase de Planificación e Inicio (33%)**. 🏗️📐`
          : `Buscando la orden **#${text}** en el sistema de Bracasfood... Actualmente se encuentra **En Camino (66%)** y va directo a tu ubicación. 🛵✨`;
        this.trackingActive.set(false);

        this.messages.update((prev) => [...prev, { role: 'model', text: response }]);
        this.isLoading.set(false);
        return;
      }

      const currentStep = this.step();

      switch (currentStep) {
        case 1:
          if (lowerText.includes('seguimiento') || lowerText.includes('3')) {
            response = isSchneider
              ? 'Por favor, escríbeme el **ID de radicado u orden de obra** (ejemplo: _CS-842_) para consultar el estado del proyecto en tiempo real. 📍'
              : 'Por favor, escríbeme el **ID o código de tu pedido** (ejemplo: _BR-323_) para consultar su estado en tiempo real. 📍';
            this.trackingActive.set(true);
          } else if (lowerText.includes('pagar') || lowerText.includes('2')) {
            const tieneItems = this.cartService.items ? this.cartService.items().length > 0 : false;
            if (tieneItems) {
              response = isSchneider
                ? '🛍️ ¡Excelente! **¿A qué dirección o ubicación se realizará la obra o servicio?**'
                : '🛍️ ¡Excelente! **¿A qué dirección enviamos tu pedido?**';
              this.step.set(4);
            } else {
              response = isSchneider
                ? '🛒 Tu lista de cotización está vacía. ¡Toca un servicio para empezar!'
                : '🛒 Tu carrito está vacío. ¡Toca un producto para empezar!';
            }
          } else {
            response = isSchneider
              ? '🏗️ ¡Dale! Selecciona los servicios de ingeniería y acabados que desees de la lista:'
              : '🛵 ¡Dale! Selecciona los productos que desees de la lista:';
            this.step.set(1);
          }
          break;

        case 2:
          const cantidad = parseInt(text);
          if (!isNaN(cantidad) && cantidad > 0) {
            const prod = this.productoEnCurso();
            this.onAddToCart(prod.name, prod.price, prod.category, prod.image || '', cantidad);

            if (lowerText.includes('pagar')) {
              response = isSchneider
                ? `📥 ¡Listo! **${cantidad}x ${prod.name}** añadidos a tu cotización.\n\n🛍️ **¿A qué dirección o ubicación se realizará la obra o servicio?**`
                : `📥 ¡Listo! **${cantidad}x ${prod.name}** añadidos.\n\n🛍️ **¿A qué dirección enviamos tu pedido?**`;
              this.step.set(4);
            } else {
              response = `📥 Añadido **${cantidad}x ${prod.name}**.\n\n¿Quieres agregar algo más o ya deseas **pagar**?`;
              this.step.set(3);
            }
          } else {
            response = '⚠️ Por favor, dime un número válido para la cantidad.';
          }
          break;

        case 3:
          if (lowerText.includes('pagar') || lowerText.includes('pago') || lowerText.includes('2')) {
            const total = this.cartService.totalPagar();

            if (total === 0) {
              response = isSchneider
                ? '🛒 Tu lista de cotización está vacía. ¡Elige un servicio antes de pagar!'
                : '🛒 Tu carrito está vacío. ¡Elige un producto antes de pagar!';
              this.step.set(1);
            } else {
              response = isSchneider
                ? `🛍️ ¡Listo! Tu presupuesto estimado suma **$${total.toLocaleString('es-CO')}**.\n\n¿A qué **dirección o ubicación** se realizará la obra o servicio?`
                : `🛍️ ¡Listo! Tu pedido suma **$${total.toLocaleString('es-CO')}**.\n\n¿A qué **dirección** enviamos tu pedido?`;
              this.step.set(4);
            }
          } else {
            response = isSchneider
              ? '🏗️ ¡Vale! Sigue eligiendo servicios. Cuando estés listo, escribe **"pagar"**.'
              : '🛵 ¡Vale! Sigue eligiendo. Cuando estés listo, escribe **"pagar"**.';
            this.step.set(1);
          }
          break;

        case 4:
          this.datosPedido.direccion = text;
          const totalConfirmado = this.cartService.totalPagar();
          response = isSchneider
            ? `✅ *Ubicación de Obra: ${text}*\n💰 *Presupuesto Estimado: $${totalConfirmado.toLocaleString('es-CO')}*\n\n¿Cómo deseas gestionar tu anticipo o pago? \n\n💸 **Efectivo** \n💱 **Nequi**`
            : `✅ *Dirección: ${text}*\n💰 *Total: $${totalConfirmado.toLocaleString('es-CO')}*\n\n¿Cómo deseas pagar? \n\n💸 **Efectivo** \n💱 **Nequi**`;
          this.step.set(5);
          break;

        case 5:
          this.datosPedido.pago = text;
          const esNequi = lowerText.includes('nequi');
          const colorBoton = esNequi ? 'morado' : 'verde';
          response = isSchneider
            ? `🎯 *¡CONTRATACIÓN LISTA!*\n\n1️⃣ Toca el botón **${colorBoton}**\n2️⃣ Confirma los detalles técnicos y cronograma en WhatsApp.\n3️⃣ ¡Y listo! Agendaremos el inicio de tu proyecto.`
            : `🎯 *¡TODO LISTO!*\n\n1️⃣ Toca el botón **${colorBoton}**\n2️⃣ Confirma el mensaje en WhatsApp.\n3️⃣ ¡Y listo! Estaremos procesando tu pedido.`;
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
    const urlWhatsApp = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
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
      const urlWhatsApp = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
      window.open(urlWhatsApp, '_blank');
      this.dispararConfeti();
    }
  }

  // ➕➖ Método para incrementar o disminuir la cantidad local en la tarjeta
  public cambiarCantidadLocal(prod: any, cambio: number): void {
    if (!prod.quantity) {
      prod.quantity = 1;
    }
    prod.quantity += cambio;
    if (prod.quantity < 1) {
      prod.quantity = 1;
    }
  }

  public onAddToCart(
    name: string,
    price: number,
    category: string,
    image: string,
    quantity: number | string,
  ): void {
    const qty = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
    if (isNaN(qty) || qty <= 0) return;

    const productoParaCarrito = {
      id: this.productoEnCurso()?.id || 'prod-bot',
      name,
      price,
      category,
      image: image || 'assets/bracasfoodbolis.webp',
      quantity: qty
    };

    const servicioAsAny = this.cartService as any;

    if (servicioAsAny.addItem && typeof servicioAsAny.addItem === 'function') {
      servicioAsAny.addItem(productoParaCarrito);
    } else if (servicioAsAny.addProduct && typeof servicioAsAny.addProduct === 'function') {
      servicioAsAny.addProduct(productoParaCarrito);
    } else if (servicioAsAny.addToCart && typeof servicioAsAny.addToCart === 'function') {
      servicioAsAny.addToCart(productoParaCarrito);
    } else if (servicioAsAny.items) {
      const currentItems = typeof servicioAsAny.items === 'function' ? servicioAsAny.items() : (servicioAsAny.items || []);
      const itemsArreglo = Array.isArray(currentItems) ? currentItems : [];
      const index = itemsArreglo.findIndex((i: any) => i.name === name);
      
      let updatedItems: any[];
      if (index !== -1) {
        updatedItems = itemsArreglo.map((item: any, i: number) => 
          i === index ? { ...item, quantity: (item.quantity || 0) + qty } : item
        );
      } else {
        updatedItems = [...itemsArreglo, productoParaCarrito];
      }

      if (typeof servicioAsAny.items.set === 'function') {
        servicioAsAny.items.set(updatedItems);
      } else if (typeof servicioAsAny.items.update === 'function') {
        servicioAsAny.items.update(() => updatedItems);
      }
    }
  }

  public seleccionarProductoDesdeBot(prod: any): void {
    this.productoEnCurso.set(prod);
    this.onAddToCart(prod.name, prod.price, prod.category, prod.image || '', 1);

    this.messages.update((prev) => [
      ...prev,
      { role: 'user', text: `Añadir ${prod.name}` },
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
