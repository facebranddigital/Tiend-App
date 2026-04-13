import { Component, computed } from '@angular/core';
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
  
  constructor(public cartService: CartService) {}

  // Calculamos el total de la suma de precios
  total = computed(() => {
    return this.cartService.cartItems().reduce((acc, item) => acc + item.price, 0);
  });

  // Eliminar un solo producto por su posición
  onDelete(index: number) {
    this.cartService.cartItems.update(prev => prev.filter((_, i) => i !== index));
  }

  // Vaciar todo
  onClear() {
    if(confirm('¿Deseas vaciar el carrito?')) {
      this.cartService.clearCart();
    }
  }

  onCheckout() {
    // Aquí conectarás tu SDK de Mercado Pago pronto
    alert(`Iniciando pago por: $${this.total()}`);
  }
}