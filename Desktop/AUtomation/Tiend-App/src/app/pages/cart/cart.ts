import { Component, inject } from '@angular/core';
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

  onDelete(index: number) {
    this.cartService.removeFromCart(index);
  }

  onClear() {
    this.cartService.clearCart();
  }
}
