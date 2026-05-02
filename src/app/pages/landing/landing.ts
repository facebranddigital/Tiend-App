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

  // --- LÓGICA DE PASOS DEL PEDIDO ---
  step = signal(0); // 0: Charla, 1: Dirección, 2: Pago, 3: Confirmación
  datosPedido = {
    direccion: '',
    pago: '',
  };

  products = [
    {
      id: 'platanos',
      name: 'Platanos BF',
      price: 2500,
      category: 'Snacks',
      image: 'assets/bracasfood2.webp',
    },
    {
      id: 'bolis-leche',
      name: 'Bolis de Leche',
      price: 2000,
      category: 'Pasabocas',
      image: 'assets/bracasfoodbolis.webp',
    },
    {
      id: 'bolis-natural',
      name: 'Bolis Naturales',
      price: 1500,
      category: 'Postres',
      image: 'assets/bolismorados.webp',
    },
    {
      id: 'papitas',
      name: 'Papitas BF',
      price: 2500,
      category: 'Snacks',
      image: 'assets/papasbf.webp',
    },
    {
      id: 'tocineta',
      name: 'Tocineta BF',
      price: 2500,
      category: 'Snacks',
      image: 'assets/tocinetabf.webp',
    },
  ];

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return [];
    return this.products.filter((p) => p.name.toLowerCase().includes(term));
  });

  registerForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
  });

  // --- MÉTODOS DEL CHAT ---
  toggleChat() {
    this.isOpen.update((v) => !v);
  }

  sendMessage() {
    const text = this.userInput.trim();
    if (!text) return;

    // Guardamos el input original para capturar datos (con mayúsculas si es dirección)
    const originalInput = this.userInput;
    const lowerText = text.toLowerCase();

    this.messages.update((prev) => [...prev, { role: 'user', text: originalInput }]);
    this.userInput = '';
    this.isLoading.set(true);

    setTimeout(() => {
      let response = '';

      // PASO 1: El bot recibió la dirección y pide el pago
      if (this.step() === 1) {
        this.datosPedido.direccion = originalInput;
        response =
          '¡Anotado! 📍 Ahora dime, ¿cómo prefieres pagar? (Efectivo, Nequi o Transfiya) 💸';
        this.step.set(2);
      }
      // PASO 2: El bot recibió el pago y muestra el resumen
      else if (this.step() === 2) {
        this.datosPedido.pago = originalInput;
        response = `✅ *RESUMEN DE TU PEDIDO:*\n\n📍 *Dirección:* ${this.datosPedido.direccion}\n💰 *Pago:* ${this.datosPedido.pago}\n\nPresiona el botón verde de abajo para enviarme el pedido completo por WhatsApp. 👇`;
        this.step.set(3);
      }
      // FLUJO NORMAL DE PREGUNTAS
      else {
        if (lowerText.includes('bolis')) {
          response =
            '¡Los Bolis de Leche son a $2.000 y los Naturales a $1.500! ¿Cuál deseas probar? 🧊';
        } else if (lowerText.includes('leche')) {
          response =
            'De Leche 🥛 tenemos: Oreo, Fresa y Chocolate. ¡Son súper cremosos! ¿Cuál te pido?';
        } else if (lowerText.includes('natural')) {
          response =
            'De Fruta 🍓 tenemos: Mora, Mango y Sandía. ¡Súper refrescantes! ¿Cuál quieres?';
        } else if (
          lowerText.includes('pedido') ||
          lowerText.includes('comprar') ||
          lowerText.includes('quiero')
        ) {
          response =
            '¡Claro que sí! 🛵 Para agilizar tu entrega, por favor escríbeme tu **dirección exacta** y barrio:';
          this.step.set(1);
        } else {
          response =
            '¡Hola! Soy BracasBot. Puedes preguntarme por sabores o decirme "Quiero hacer un pedido" para ayudarte. 🍦';
        }
      }

      this.messages.update((prev) => [...prev, { role: 'model', text: response }]);
      this.isLoading.set(false);
    }, 1000);
  }

  // --- FUNCIÓN MAESTRA DE WHATSAPP ---
  confirmarPedidoFinal() {
  const items = this.cartService.cartItems();
  const totalValue = this.cartService.total();
  const telefono = '573218119383';

  if (items.length === 0) return;

  let mensaje = `¡Hola Bracasfood! 👋 Confirmo mi pedido:\n\n`;

  items.forEach((item) => {
    const cantidad = item.quantity || 1;
    mensaje += `• *${cantidad}x* ${item.name} - ($${(item.price * cantidad).toLocaleString()})\n`;
  });

  mensaje += `\n💰 *Total: $${totalValue.toLocaleString()}*`;
  mensaje += `\n📍 *Dirección:* ${this.datosPedido.direccion}`;
  mensaje += `\n💸 *Pago:* ${this.datosPedido.pago}`;
  mensaje += `\n\n🛵 *¡Quedo atento a la entrega!*`;

  // AQUÍ ESTÁ EL FIX:
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');

  this.step.set(0); // Reinicia el bot
}


  // --- FUNCIONES DE LA LANDING ---
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

  hacerPedidoWhatsApp() {
    // Esta función se mantiene por si usan el botón normal de la landing
    const items = this.cartService.cartItems();
    if (items.length === 0) {
      Swal.fire({ title: '¡Carrito vacío!', text: 'Agrega algo rico primero 🌭', icon: 'info' });
      return;
    }
    this.confirmarPedidoFinal();
  }

  scrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  updateQty(amount: number) {
    this.qty2.update((v) => (v + amount < 1 ? 1 : v + amount));
  }
  toggleModal() {
    this.showModal.update((v) => !v);
  }
  toggleRegisterModal() {
    this.showRegisterModal.update((v) => !v);
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.confirmarPedidoFinal();
      this.toggleRegisterModal();
      this.registerForm.reset();
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
