import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from './cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: '<div></div>',
})
export class CartComponent {
  constructor(public cartService: CartService) {}

  eliminarItem(id: any) {
    this.cartService.removeFromCart(id);
  }

  enviarPedido() {
    if (this.cartService.cartItems().length === 0) return;

    const idUnico = 'BR-' + Math.floor(1000 + Math.random() * 9000);
    const mensaje = this.cartService.obtenerTextoPedido(idUnico);
    const telefono = '573218119383';

    // TU FORMATO GANADOR: Limpio, directo y sin barras estúpidas intermedias
    const urlWhatsApp = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(urlWhatsApp, '_blank');
  }
}
