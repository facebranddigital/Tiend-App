import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service'; // FIX: Faltaba este import
import { take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

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
export class LandingComponent {
  public cartService = inject(CartService);
  public auth = inject(AuthService);
  private musica = new Audio('assets/relaxshiva.mp3'); // Asegúrate que sea .mp3
  public musicaActiva = false;
  private route = inject(ActivatedRoute);
  constructor() {
    // Escucha la URL para detectar el escaneo del QR físico
    this.route.queryParams.subscribe((params) => {
      if (params['openbot'] === 'true') {
        setTimeout(() => {
          this.isOpen.set(true); // Abre el chat
          this.messages.set([
            {
              role: 'model',
              text:
                '¡Hola! 🤖 Veo que vas a realizar un pago de **Bracasfood**. \n\n' +
                'Para procesarlo rápido, por favor dime tu **dirección de entrega**: ',
            },
          ]);
          this.step.set(4); // Salto directo al paso de Dirección
        }, 1500);
      }
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
        .catch((err) => console.log('Audio bloqueado temporalmente'));
    };
    document.addEventListener('click', activarAudio);
  }

  // --- FUNCIÓN DE FORMATO (DEBE IR AQUÍ AFUERA) ---
  formatText(text: string): string {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>'); // <--- AGREGA ESTA LÍNEA si no la tienes
  }

  toggleMusica() {
    if (this.musica.paused) {
      this.musica.play();
      this.musicaActiva = true;
    } else {
      this.musica.pause();
      this.musicaActiva = false;
    }
  }

  // --- SEÑALES DE ESTADO ---
  showModal = signal(false);
  showRegisterModal = signal(false);
  qty2 = signal(1);
  searchTerm = signal('');

  // --- SEÑALES DEL CHAT ---
  isOpen = signal(false);
  isLoading = signal(false);
  userInput: string = '';
  messages = signal<Message[]>([]);

  // ... resto de tu código (step, pedidoTemporal, etc.)

  // Pasos: 0:Inicio, 1:Selección, 2:Cantidad, 3:¿Algo más?, 4:Dirección, 5:Pago, 6:Resumen Final
  step = signal(0);
  pedidoTemporal = signal<{ name: string; qty: number; subtotal: number }[]>([]);
  productoEnCurso = signal<any>(null);

  datosPedido = {
    direccion: '',
    pago: '',
  };

  products = [
    // chart info //
    // BOLIS DE LECHE (Subcategorías)
    { id: 'bolis-oreo', name: 'Bolis Oreo 🍪', price: 2000, category: 'Bolis' },
    { id: 'bolis-fresa', name: 'Bolis Fresa 🍓', price: 2000, category: 'Bolis' },
    { id: 'bolis-choco', name: 'Bolis Chocolate 🍫', price: 2000, category: 'Bolis' },

    // BOLIS NATURALES (Subcategorías)
    { id: 'bolis-mora', name: 'Bolis Mora 🍇', price: 1500, category: 'Bolis' },
    { id: 'bolis-mango', name: 'Bolis Mango 🥭', price: 1500, category: 'Bolis' },
    { id: 'bolis-sandia', name: 'Bolis Sandía 🍉', price: 1500, category: 'Bolis' },

    // PASABOCAS
    { id: 'papitas', name: 'Papitas BF 🍟', price: 2500, category: 'Pasabocas' },
    { id: 'platanos', name: 'Platanos BF 🥓', price: 2500, category: 'Pasabocas' },
    { id: 'tocineta', name: 'Tocineta BF 🥩', price: 2500, category: 'Pasabocas' },
  ];

  // --- NAVEGACIÓN ---
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // --- LÓGICA DEL CHAT BOT ---
  toggleChat() {
    this.isOpen.update((v) => !v);

    // Si el chat se abre y no hay mensajes, lanzamos el menú de inmediato
    if (this.isOpen() && this.messages().length === 0) {
      this.messages.set([
        {
          role: 'model',
          text:
            '¡Hola! Soy BracasBot 🤖. Aquí tienes nuestro menú para hoy: \n\n' +
            '1. **Hacer un pedido** 🛵 \n' +
            '2. **Pagar un pedido** 💸',
        },
      ]);

      // Seteamos el paso 1 para que el bot esté listo para recibir la selección
      this.step.set(1);

      // Opcional: Mostrar los productos de una vez en el chat
      this.messages.update((prev) => [
        ...prev,
        { role: 'model', text: 'Toca un producto de la lista para agregarlo a tu pedido.' },
      ]);
    }
  }

  seleccionarProductoDesdeBot(prod: any) {
    this.productoEnCurso.set(prod);
    this.messages.update((prev) => [
      ...prev,
      { role: 'model', text: `¿Cuántas unidades de *${prod.name}* deseas?` },
    ]);
    this.step.set(2); // Esperando cantidad
  }

  sendMessage() {
    const text = this.userInput.trim();
    if (!text) return;

    const originalInput = this.userInput;
    const lowerText = text.toLowerCase();

    this.messages.update((prev) => [...prev, { role: 'user', text: originalInput }]);
    this.userInput = '';
    this.isLoading.set(true);

    setTimeout(() => {
      let response = '';

      // --- PASO 1: Menú Inicial (Aquí permitimos el salto directo) ---
      if (this.step() === 1) {
        if (lowerText.includes('pagar') || lowerText.includes('2')) {
          response = '¡Excelente! 🛍️ Vamos a procesar tu pago. Dime la **dirección de entrega**:';
          this.step.set(4); // Salta directo a pedir dirección sin validar carrito
        } else if (lowerText.includes('pedido') || lowerText.includes('1')) {
          response = '¡Claro! 🛵 Toca el producto que quieres añadir a tu lista:';
          this.step.set(1);
        } else {
          response = '¿Qué te gustaría hacer? 🤔 \n 1. **Hacer pedido** \n 2. **Pagar**';
        }
      }

      // --- PASO 2: Recibe cantidad ---
      else if (this.step() === 2) {
        const cantidad = parseInt(originalInput);
        if (isNaN(cantidad) || cantidad <= 0) {
          response = 'Por favor, escribe un número válido para la cantidad. 🔢';
        } else {
          const prod = this.productoEnCurso();
          this.pedidoTemporal.update((prev) => [
            ...prev,
            { name: prod.name, qty: cantidad, subtotal: prod.price * cantidad },
          ]);
          const totalActual = this.pedidoTemporal().reduce((acc, item) => acc + item.subtotal, 0);
          response = `✅ Añadido: *${cantidad}x ${prod.name}*.\nTu total va en: *$${totalActual.toLocaleString()}*.\n\n¿Deseas **añadir otro** producto o prefieres **finalizar** el pedido para pagar?`;
          this.step.set(3);
        }
      }

      // --- PASO 3: Decisión (Pagar desde el flujo de compra) ---
      else if (this.step() === 3) {
        if (
          lowerText.includes('pagar') ||
          lowerText.includes('finalizar') ||
          lowerText.includes('2')
        ) {
          response = '¡Excelente! 🛍️ Vamos a procesar tu pedido. Dime la **dirección de entrega**:';
          this.step.set(4);
        } else {
          response = '¡Claro! 🛵 Toca el producto que quieres añadir a tu lista:';
          this.step.set(1);
        }
      }

      // --- PASO 4: Recibe dirección ---
      else if (this.step() === 4) {
        this.datosPedido.direccion = originalInput;
        response = '📍 Dirección anotada. Ahora dime, ¿cómo prefieres pagar? (Efectivo o Nequi) 💸';
        this.step.set(5);
      }

      // --- PASO 5: Pago y QR de Nequi ---
      else if (this.step() === 5) {
        this.datosPedido.pago = originalInput;
        this.isLoading.set(false);

        if (lowerText.includes('nequi')) {
          const total = this.pedidoTemporal().reduce((acc, item) => acc + item.subtotal, 0);
          const textoMonto = total > 0 ? `por **$${total.toLocaleString()}**` : 'de tu compra';

          const mensajeNequi = `
✅ *¡LISTO PARA PAGAR!* 🚀

Para completar tu pedido ${textoMonto}, por favor:

1️⃣ Escanea el **QR de Nequi** que ves abajo.
2️⃣ Realiza el pago total.
3️⃣ **ENVÍA EL PANTALLAZO** por aquí para confirmar.

_¡Gracias por elegir Bracasfood!_ 🍔`;

          this.messages.update((prev) => [
            ...prev,
            { role: 'model', text: mensajeNequi },
            {
              role: 'model',
              text: '<img src="assets/nequiqr.jpeg" style="width: 100%; max-width: 150px; border-radius: 12px; margin: 5px auto; display: block; border: 2px solid #643193;">',
            },
          ]);
          this.step.set(6);
          return;
        } else {
          this.generarResumenFinal();
          return;
        }
      }

      if (response) {
        this.messages.update((prev) => [...prev, { role: 'model', text: response }]);
      }
      this.isLoading.set(false);
    }, 1000);
  }

  generarResumenFinal() {
    let totalPedido = 0;
    let tabla = '--- 🧾 RECIBO DE COMPRA --- \n';
    tabla += '```\n';
    tabla += 'PRODUCTO       | CANT | TOTAL\n';
    tabla += '------------------------------\n';

    const productosCombinados = [
      ...this.cartService.items().map((item: any) => ({
        name: item.name,
        qty: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      ...this.pedidoTemporal(),
    ];

    productosCombinados.forEach((item) => {
      const name = item.name.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 12);
      const row = `${name.padEnd(14, ' ')} | ${item.qty.toString().padStart(4, ' ')} | $${item.subtotal.toLocaleString()}\n`;
      tabla += row;
      totalPedido += item.subtotal;
    });

    tabla += '------------------------------\n';
    tabla += `TOTAL A PAGAR:      $${totalPedido.toLocaleString()}\n`;
    tabla += '------------------------------\n';
    tabla += '```\n';
    tabla += `📍 *Entrega:* ${this.datosPedido.direccion}\n`;
    tabla += `💳 *Método:* ${this.datosPedido.pago}\n\n`;
    tabla += '¡Gracias por elegir **BracasFood**! 🔥';

    this.messages.update((prev) => [...prev, { role: 'model', text: tabla }]);
    this.isLoading.set(false);
    this.step.set(6);
  }

  confirmarPedidoWhatsApp() {
    const telefono = '573218119383';
    let mensaje = `*📦 NUEVO PEDIDO BRACASFOOD*\n\n`;
    mensaje += `--------------------------\n`;

    let total = 0;
    const productosFinales = [
      ...this.cartService.items().map((item: any) => ({
        name: item.name,
        qty: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      ...this.pedidoTemporal(),
    ];

    productosFinales.forEach((item) => {
      mensaje += `• *${item.qty}x* ${item.name} ($${item.subtotal.toLocaleString()})\n`;
      total += item.subtotal;
    });

    mensaje += `--------------------------\n`;
    mensaje += `💰 *TOTAL A PAGAR: $${total.toLocaleString()}*\n`;
    mensaje += `📍 *DIRECCIÓN:* ${this.datosPedido.direccion}\n`;
    mensaje += `💸 *FORMA DE PAGO:* ${this.datosPedido.pago}\n\n`;
    mensaje += `🛵 _Pedido enviado vía BracasBot_`;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    this.resetearTodo();
  }

  confirmarPagoEnWhatsApp() {
    const telefono = '573218119383';
    // FIX: Cálculo manual del total
    const totalBot = this.pedidoTemporal().reduce((acc, item) => acc + item.subtotal, 0);
    const totalWeb = this.cartService
      .items()
      .reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
    const totalFinal = totalBot > 0 ? totalBot : totalWeb;

    const texto =
      `¡Hola Bracasfood! 🍔\n\n` +
      `Acabo de realizar mi pago por *${this.datosPedido.pago}*.\n` +
      `📍 *Dirección:* ${this.datosPedido.direccion}\n` +
      `💰 *Total:* $${totalFinal.toLocaleString()}\n\n` +
      `Adjunto el pantallazo del comprobante. ✅`;

    // URL CORREGIDA: Con barra y símbolo de dólar
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;

    window.open(url, '_blank');
    this.resetearTodo();
  }

  hacerPedidoWhatsApp() {
    this.isOpen.set(true);
    this.messages.update((prev) => [
      ...prev,
      {
        role: 'model',
        text: '¡Hola! 🛵 Con gusto te ayudo con tu pedido. Toca los productos que quieras pedir:',
      },
    ]);
    this.step.set(1);
  }

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
      title: '¡Agregado!',
      text: `${qty}x ${name} al carrito`,
      icon: 'success',
      confirmButtonColor: '#ff6b00',
      timer: 1500,
      showConfirmButton: false,
    });
  }

  updateQty(amount: number) {
    this.qty2.update((v) => (v + amount < 1 ? 1 : v + amount));
  }

  private resetearTodo() {
    this.step.set(0);
    this.pedidoTemporal.set([]);
    this.isOpen.set(false);
  }
} // <--- ESTA CIERRA LA CLASE LandingComponent (Debe ser la última)
