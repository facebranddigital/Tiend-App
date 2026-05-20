import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { FirebaseService } from '../../services/firebase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class CartComponent implements OnInit, OnDestroy {
  public cartService = inject(CartService);
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);

  // Guardamos el uid del usuario autenticado en sesión
  private usuarioUid: string | null = null;
  private authSub!: Subscription;

  ngOnInit(): void {
    // Escuchamos el estado del usuario apenas carga el carrito
    this.authSub = this.firebaseService.usuarioActivo$.subscribe((user) => {
      if (user) {
        this.usuarioUid = user.uid;
      } else {
        this.usuarioUid = null;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  eliminarItem(id: any) {
    this.cartService.removeFromCart(id);
  }

  async enviarPedido() {
    if (this.cartService.cartItems().length === 0) return;

    // Si el usuario no ha iniciado sesión, lo redirigimos al login antes de comprar
    if (!this.usuarioUid) {
      alert('Por favor, inicia sesión para poder procesar tu pedido de forma segura.');
      this.router.navigate(['/login']);
      return;
    }

    // 1. Generamos el ID único del pedido
    const idUnico = 'BR-' + Math.floor(1000 + Math.random() * 9000);

    // 2. Preparamos la estructura exacta para Firestore (ahora amarrada al userId del cliente)
    const nuevaOrden = {
      id: idUnico,
      userId: this.usuarioUid, // ✅ Enlace directo de seguridad estilo Facebook
      status: 'received',
      estimatedTime: 35,
      repartidorLat: 3.4385,
      repartidorLng: -76.523,
      items: this.cartService.cartItems(),
      total: this.cartService.totalPagar(),
      createdAt: new Date(),
    };

    try {
      // 3. Guardamos el pedido en la colección general de órdenes de Firebase
      await this.firebaseService.crearPedido(idUnico, nuevaOrden);

      // 4. Actualizamos el perfil del usuario para recordar su orden persistente
      await this.firebaseService.vincularPedidoAUsuario(this.usuarioUid, idUnico);

      // 5. Guardamos en el almacenamiento local como plan de respaldo rápido
      localStorage.setItem('ultimoPedidoId', idUnico);

      // 6. Preparamos y abrimos la API oficial de WhatsApp
      const mensaje = this.cartService.obtenerTextoPedido(idUnico);
      const telefono = '573218119383';
      const urlWhatsApp = `https://wa.me{telefono}?text=${encodeURIComponent(mensaje)}`;
      window.open(urlWhatsApp, '_blank');

      // 7. ✅ Vaciamos el carrito automáticamente tras una compra exitosa
      this.cartService.clearCart();

      // 8. Redirigimos de inmediato al usuario a la pantalla de seguimiento
      this.router.navigate(['/seguimiento', idUnico]);
    } catch (error) {
      console.error('Error al registrar el pedido en Firestore:', error);
      alert('Hubo un problema al procesar tu orden. Por favor, intenta de nuevo.');
    }
  }
}
