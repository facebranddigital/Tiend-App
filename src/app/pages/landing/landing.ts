import { Component, signal, computed, inject } from '@angular/core';
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
export class LandingComponent {
  public cartService = inject(CartService);
  public auth = inject(AuthService);
  private musica = new Audio('assets/relaxshiva.mp3');
  public musicaActiva = false;
  private route = inject(ActivatedRoute);

  // --- SEÑALES DE ESTADO ---
  showModal = signal(false);
  showRegisterModal = signal(false);
  qty2 = signal(1);
  searchTerm = signal('');
  isOpen = signal(false);
  isLoading = signal(false);
  userInput: string = '';
  messages = signal<Message[]>([]);
  step = signal(0);
  pedidoTemporal = signal<{ name: string; qty: number; subtotal: number }[]>([]);
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
              text: '¡Hola! 🤖 Veo que vas a realizar un pago de **Bracasfood**. \n\(\nPara\) procesarlo rápido, por favor dime tu **dirección de entrega**: ',
            },
          ]);
          this.step.set(4);
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
        .catch(() => console.log('Audio bloqueado'));
    };
    document.addEventListener('click', activarAudio);
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
          response = '¡Excelente! 🛍️ Dime la **dirección de entrega**:';
          this.step.set(4);
        } else {
          response = '¡Claro! 🛵 Toca un producto para añadirlo:';
          this.step.set(1);
        }
      } else if (this.step() === 4) {
        this.datosPedido.direccion = originalInput;
        response = '📍 Dirección anotada. ¿Cómo pagarás? (Efectivo o Nequi) 💸';
        this.step.set(5);
      } else if (this.step() === 5) {
        this.datosPedido.pago = originalInput;
        this.isLoading.set(false);
        const msgCierre = `🚀 *¡PROCESO INICIADO!*\n\nPara recibir tu **QR de Nequi**:\n1️⃣ Toca el botón verde.\n2️⃣ Envía el mensaje.\n3️⃣ Mi asistente te pasará el QR.`;
        this.messages.update((prev) => [...prev, { role: 'model', text: msgCierre }]);
        this.step.set(6);
        return;
      }

      if (response) this.messages.update((prev) => [...prev, { role: 'model', text: response }]);
      this.isLoading.set(false);
    }, 1000);
  }

  // --- FUNCIONES QUE PIDE EL HTML (FIX) ---

  hacerPedidoWhatsApp() {
    this.isOpen.set(true);
    this.step.set(1);
  }

  confirmarPagoEnWhatsApp() {
    const telefono = '573218119383';
    const keyword = 'PAGO_NEQUI_BRACAS';
    const texto = `${keyword}\n📍 *Dirección:* ${this.datosPedido.direccion}\nDeseo el QR rápido.`;
    window.open(`https://wa.me{telefono}?text=${encodeURIComponent(texto)}`, '_blank');
    this.resetearTodo();
  }

  confirmarPedidoWhatsApp() {
    const telefono = '573218119383';
    let mensaje = `*📦 NUEVO PEDIDO BRACASFOOD*\n\n📍 *DIRECCIÓN:* ${this.datosPedido.direccion}\n💸 *PAGO:* ${this.datosPedido.pago}`;
    window.open(`https://wa.me{telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
    this.resetearTodo();
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
  }

  seleccionarProductoDesdeBot(prod: any) {
    this.productoEnCurso.set(prod);
    this.messages.update((prev) => [
      ...prev,
      { role: 'model', text: `¿Cuántas unidades de *${prod.name}*?` },
    ]);
    this.step.set(2);
  }

  toggleMusica() {
    this.musica.paused ? this.musica.play() : this.musica.pause();
    this.musicaActiva = !this.musica.paused;
  }

  updateQty(amount: number) {
    this.qty2.update((v: number) => (v + amount < 1 ? 1 : v + amount));
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  private resetearTodo() {
    this.step.set(0);
    this.pedidoTemporal.set([]);
    this.isOpen.set(false);
  }
} // <--- CIERRE ÚNICO DE LA CLASE
