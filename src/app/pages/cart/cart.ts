import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent {
  public cartService = inject(CartService);
  public paymentMethods = ['Nequi', 'Tarjeta', 'PayPal'];
  public selectedPaymentMethod = signal('Nequi');
  public paymentSuccess = signal(false);

  onDelete(index: number) {
    this.cartService.removeFromCart(index);
  }

  onClear() {
    this.cartService.clearCart();
    this.paymentSuccess.set(false);
  }

  onSelectMethod(method: string) {
    this.selectedPaymentMethod.set(method);
  }

  onCheckout() {
    if (this.cartService.count() === 0) {
      return;
    }

    this.paymentSuccess.set(true);
    this.cartService.clearCart();
  }
}
