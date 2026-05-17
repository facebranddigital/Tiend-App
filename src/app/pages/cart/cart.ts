import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
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

    // URL PERFECTA: Sin llaves rotas, usa la API oficial codificada
    const urlWhatsApp = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(urlWhatsApp, '_blank');
  }
}
