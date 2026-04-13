import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class CartComponent {
  // Estas variables son obligatorias porque tu HTML las usa:
  paymentMethods = ['Mercado Pago', 'Tarjeta de Crédito'];
  selectedPaymentMethod = signal('Mercado Pago');
  paymentSuccess = signal(false);

  constructor(public cartService: CartService) {}

  // Cálculo del total para mostrar en el resumen
  total = computed(() => {
    return this.cartService.cartItems().reduce((acc, item) => acc + item.price, 0);
  });

  // Función para borrar un ítem
  onDelete(index: number) {
    this.cartService.cartItems.update(prev => prev.filter((_, i) => i !== index));
  }

  // Función para vaciar todo el carrito
  onClear() {
    this.cartService.clearCart();
  }

  // Función para cambiar método de pago
  onSelectMethod(method: string) {
    this.selectedPaymentMethod.set(method);
  }

  onCheckout() {
    console.log('Iniciando checkout con:', this.selectedPaymentMethod());
    // Aquí es donde meteremos el SDK de Mercado Pago
  }
}