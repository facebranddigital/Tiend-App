import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class CartComponent {
  public cartService = inject(CartService);
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);

  eliminarItem(id: any) {
    this.cartService.removeFromCart(id);
  }

  async enviarPedido() {
    if (this.cartService.cartItems().length === 0) return;

    // Generamos el ID único del pedido
    const idUnico = 'BR-' + Math.floor(1000 + Math.random() * 9000);

    // Preparamos la estructura exacta de datos para Firestore
    const nuevaOrden = {
      id: idUnico,
      status: 'received',
      estimatedTime: 35,
      repartidorLat: 3.4385,
      repartidorLng: -76.523,
      items: this.cartService.cartItems(),
      createdAt: new Date(),
    };

    try {
      // 1. Guarda automáticamente en tu base de datos de Firebase
      await this.firebaseService.crearPedido(idUnico, nuevaOrden);

      // 2. Prepara y abre la ventana oficial de WhatsApp
      const mensaje = this.cartService.obtenerTextoPedido(idUnico);
      const telefono = '573218119383';
      const urlWhatsApp = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
      window.open(urlWhatsApp, '_blank');

      // 3. Redirige de inmediato al usuario a la pantalla de seguimiento
      this.router.navigate(['/seguimiento', idUnico]);
    } catch (error) {
      console.error('Error al registrar el pedido en Firestore:', error);
      alert('Hubo un problema al procesar tu orden. Por favor, intenta de nuevo.');
    }
  }
}
