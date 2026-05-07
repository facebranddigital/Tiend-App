import { Component, signal, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
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

  constructor() {
    this.route.queryParams.subscribe((params) => {
      if (params['openbot'] === 'true') {
        setTimeout(() => {
          this.isOpen.set(true);
          this.messages.set([
            {
              role: 'model',
              text: '¡Hola! ⚡Muchas gracias por tu compra ⚡ Proceso de **pago rápido** iniciado.\n\nToca el botón de abajo para recibir el QR de Nequi en WhatsApp.',
            },
          ]);
          // Seteamos datos automáticos para que no los pida
          this.datosPedido.direccion = 'PAGO EN PERSONA (LOCAL)';
          this.datosPedido.pago = 'Nequi';
          this.step.set(6); // Ir directo al botón de WhatsApp
        }, 1000);
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
        .catch(() => console.log('Audio bloqueado'));
    };
    document.addEventListener('click', activarAudio);
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
          text: '¡Hola! Soy BracasBot 🤖. ¿Qué deseas hacer hoy? \n\n1️⃣ **Hacer un pedido** 🛵 \n2️⃣ **Pagar un pedido** 💸',
        },
      ]);
      this.step.set(1);
    }
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
      if (this.step() === 1) {
        if (lowerText.includes('pagar') || lowerText.includes('2')) {
          response = '🛍️ Dime tu **dirección**';
          this.step.set(4);
        } else {
          response = '🛵 Toca un producto de la lista para añadirlo:';
          this.step.set(1);
        }
      } else if (this.step() === 2) {
        const cantidad = parseInt(originalInput);
        if (!isNaN(cantidad) && cantidad > 0) {
          const prod = this.productoEnCurso();
          this.onAddToCart(prod.name, prod.price, prod.category, '', cantidad);
          response = `✅ Añadido **${cantidad}x ${prod.name}**. ¿Algo más o escribes "pagar"?`;
          this.step.set(1);
        } else {
          response = '⚠️ Por favor, dime un número válido.';
        }
      } else if (this.step() === 4) {
        this.datosPedido.direccion = originalInput;
        response = '✅ *¡LISTO!* ¿Pagarás con**Efectivo💸** o **Nequi**';
        this.step.set(5);
      } else if (this.step() === 5) {
        this.datosPedido.pago = originalInput;
        this.isLoading.set(false);
        const esNequi = lowerText.includes('nequi');
        const color = esNequi ? 'morado' : 'verde';
        const msgCierre = `🚀 *¡LISTO!*\n\n1️⃣ Toca el botón **${color}**.\n2️⃣ Envía el mensaje.\n3️⃣ Recibe tu QR o confirmación.`;
        this.messages.update((prev) => [...prev, { role: 'model', text: msgCierre }]);
        this.step.set(6);
        return;
      }

      if (response) this.messages.update((prev) => [...prev, { role: 'model', text: response }]);
      this.isLoading.set(false);
    }, 1000);
  }

  // --- INTEGRACIÓN WHATSAPP ---

  hacerPedidoWhatsApp() {
    this.isOpen.set(true);
    this.step.set(1);
  }

  confirmarPagoEnWhatsApp() {
    const telefono = '573218119383';
    const keyword = 'PAGO_NEQUI_BRACAS';
    const items = this.cartService.items();

    let texto = '';

    if (items.length > 0) {
      // Si compró algo por la web, sí mostramos detalles
      const lista = items.map((i) => `• ${i.name} x${i.quantity}`).join('\n');
      const total = items.reduce((acc, i) => acc + i.price * (i.quantity || 1), 0);
      texto = `*${keyword}* 🚀\n\n📦 *PEDIDO:*\n${lista}\n💰 *TOTAL:* $${total.toLocaleString('es-CO')}\n📍 *ENTREGA:* En el local`;
    } else {
      // PAGO EXPRESS (Lo que usa tu mamá en la calle)
      texto = `*${keyword}* ⚡\n\n✅ *PAGO EXPRESS*\n📥 Descarga el QR  🖨️ Escanealo en Nequi   📲 Envianoa el comprobante\n\nSolicito el QR de Nequi.`;
    }

    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`, '_blank');
    this.resetearTodo();
  }

  confirmarPedidoWhatsApp() {
    const telefono = '573218119383';
    const direccion = this.datosPedido.direccion || 'No especificada';
    const items = this.cartService.items();
    let lista =
      items.length > 0 ? items.map((i) => `• ${i.name} x${i.quantity}`).join('\n') + '\n\n' : '';

    const mensaje = `*📦 NUEVO PEDIDO*\n\n${lista}📍 *DIR:* ${direccion}\n💸 *PAGO:* ${this.datosPedido.pago}`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
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
