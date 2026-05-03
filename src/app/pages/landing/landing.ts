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

  // --- SEÑALES DEL CHAT (PUNTO DE VENTA) ---
  isOpen = signal(false);
  isLoading = signal(false);
  userInput: string = '';
  messages = signal<Message[]>([]);

  // Pasos: 0:Inicio, 1:Selección, 2:Cantidad, 3:¿Algo más?, 4:Dirección, 5:Pago, 6:Resumen Final
  step = signal(0);
  pedidoTemporal = signal<{ name: string; qty: number; subtotal: number }[]>([]);
  productoEnCurso = signal<any>(null);

  datosPedido = {
    direccion: '',
    pago: '',
  };

  products = [
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
    if (this.isOpen() && this.messages().length === 0) {
      this.messages.set([
        { role: 'model', text: '¡Hola! Soy BracasBot 🤖. ¿Te gustaría hacer un pedido ahora?' },
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

      // PASO 2: Recibe la cantidad escrita por el usuario
      if (this.step() === 2) {
        const cantidad = parseInt(originalInput);
        if (isNaN(cantidad) || cantidad <= 0) {
          response = 'Por favor, escribe un número válido para la cantidad.';
        } else {
          const prod = this.productoEnCurso();
          this.pedidoTemporal.update((prev) => [
            ...prev,
            {
              name: prod.name,
              qty: cantidad,
              subtotal: prod.price * cantidad,
            },
          ]);
          response = `✅ Añadido: *${cantidad}x ${prod.name}*.\n\n¿Deseas añadir otro producto o prefieres finalizar el pedido?`;
          this.step.set(3);
        }
      }
      // PASO 4: Recibe dirección
      else if (this.step() === 4) {
        this.datosPedido.direccion = originalInput;
        response =
          '📍 Dirección anotada. Ahora dime, ¿cómo prefieres pagar? (Efectivo, Nequi o Transfiya) 💸';
        this.step.set(5);
      }
      // PASO 5: Recibe pago y genera el Cuadro Final
      else if (this.step() === 5) {
        this.datosPedido.pago = originalInput;
        this.generarResumenFinal();
        return;
      }
      // FLUJO INICIAL
      else {
        if (
          lowerText.includes('pedido') ||
          lowerText.includes('quiero') ||
          lowerText.includes('comprar') ||
          lowerText.includes('si')
        ) {
          response = '¡Excelente! 🛵 Toca el producto que quieres añadir a tu lista:';
          this.step.set(1);
        } else {
          response =
            '¡Hola! Soy BracasBot. Puedes decirme "Quiero un pedido" para guiarte en tu compra. 🍦';
        }
      }

      this.messages.update((prev) => [...prev, { role: 'model', text: response }]);
      this.isLoading.set(false);
    }, 800);
  }

  generarResumenFinal() {
    // 1. Encabezado limpio y corto
    let tabla = '*RESUMEN DE COMPRA*\n\n';
    tabla += '```\n';
    tabla += 'PRODUCTO (UND)    | TOTAL\n'; 
    tabla += '--------------------------\n';

    let totalPedido = 0;
    this.pedidoTemporal().forEach((item) => {
      // 2. Limpiamos el nombre: dejamos solo letras, números y espacios
      const nameSinEmoji = item.name.replace(/[^a-zA-Z0-9 ]/g, '').trim();

      const productoConCant = `${nameSinEmoji} (x${item.qty})`;

      // 3. Reducimos el padding a 18 para que el TOTAL no se desborde a la derecha
      const rowName = productoConCant.padEnd(18, ' ');

      tabla += `${rowName} | $${item.subtotal.toLocaleString()}\n`;
      totalPedido += item.subtotal;
    });

    tabla += '--------------------------\n';
    tabla += `TOTAL: $${totalPedido.toLocaleString()}\n\`\`\`\n`;
    
    // 4. Datos finales sin iconos para ahorrar ancho de línea
    tabla += `Dir: ${this.datosPedido.direccion}\n`;
    tabla += `Pago: ${this.datosPedido.pago}\n\n`;
    tabla += `¿Todo correcto? Dale al botón verde.`;

    this.messages.update((prev) => [...prev, { role: 'model', text: tabla }]);
    this.isLoading.set(false);
    this.step.set(6);
}


  confirmarPedidoWhatsApp() {
    const telefono = '573116213800';
    let mensaje = `*📦 NUEVO PEDIDO BRACASFOOD*\n\n`;
    mensaje += `--------------------------\n`;

    let total = 0;
    this.pedidoTemporal().forEach((item) => {
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

    // Resetear todo tras enviar
    this.step.set(0);
    this.pedidoTemporal.set([]);
  }

  // --- FUNCIONES DE LA LANDING (CARRITO NORMAL) ---
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

  // --- FORMULARIO DE REGISTRO ---
  registerForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
  });

  onSubmit() {
    if (this.registerForm.valid) {
      this.confirmarPedidoWhatsApp();
      this.showRegisterModal.set(false);
      this.registerForm.reset();
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  toggleRegisterModal() {
    this.showRegisterModal.update((v) => !v);
  }
  updateQty(amount: number) {
    this.qty2.update((v) => (v + amount < 1 ? 1 : v + amount));
  }
}
