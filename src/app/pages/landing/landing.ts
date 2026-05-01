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

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss'],
})
export class LandingComponent {
  // Inyección limpia
  public cartService = inject(CartService);

  showModal = signal(false);
  showRegisterModal = signal(false);
  qty2 = signal(1);
  searchTerm = signal('');

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

  // --- FUNCIÓN DE WHATSAPP MEJORADA ---
  hacerPedidoWhatsApp() {
    // Leemos los valores actuales de las señales del servicio
    const items = this.cartService.cartItems();
    const totalValue = this.cartService.total();
    const telefono = '573116213800';

    if (!items || items.length === 0) {
      Swal.fire({
        title: '¡Carrito vacío!',
        text: 'Agrega algo rico antes de hacer tu pedido 🌭',
        icon: 'info',
        confirmButtonColor: '#ff6b00',
      });
      return;
    }

    let mensaje = `¡Hola Bracasfood! 👋 Quiero realizar el siguiente pedido:\n\n`;

    items.forEach((item) => {
      const cantidad = item.quantity || 1;
      const subtotal = item.price * cantidad;
      mensaje += `• *${cantidad}x* ${item.name} - ($${subtotal.toLocaleString()})\n`;
    });

    mensaje += `\n💰 *Total del pedido: $${totalValue.toLocaleString()}*`;
    mensaje += `\n\n¿Me confirma forma de pago? 🛵`;
    mensaje += `\n\n🛵 *Dirección de entrega:* (Escríbela aquí)`;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    // Abrimos en una ventana nueva
    window.open(url, '_blank');
  }

  scrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateQty(amount: number) {
    this.qty2.update((v) => {
      const newValue = v + amount;
      return newValue < 1 ? 1 : newValue;
    });
  }

  toggleModal() {
    this.showModal.update((v) => !v);
  }
  toggleRegisterModal() {
    this.showRegisterModal.update((v) => !v);
  }

  onAddToCart(name: string, price: any, category: string, image: string, quantity: any) {
    const qty = parseInt(quantity) || 1;
    const pPrice = parseInt(price);

    this.cartService.addToCart({
      name,
      price: pPrice,
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

  onSubmit() {
    if (this.registerForm.valid) {
      this.hacerPedidoWhatsApp();
      this.toggleRegisterModal();
      this.registerForm.reset();
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
