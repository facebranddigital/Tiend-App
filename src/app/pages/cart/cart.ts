import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class CartComponent {
  public cartService = inject(CartService);

  paymentMethods = ['Mercado Pago', 'Tarjeta de Crédito'];
  selectedPaymentMethod = signal('Mercado Pago');
  paymentSuccess = signal(false);

  total = computed(() => this.cartService.total());

  onDelete(index: number) {
    this.cartService.removeFromCart(index);
  }

  onClear() {
    this.cartService.clearCart();
  }

  onSelectMethod(method: string) {
    this.selectedPaymentMethod.set(method);
  }

  // ESTA FUNCIÓN ESTABA AFUERA, YA LA METÍ EN LA CLASE:
  onCheckout() {
    const totalAmount = this.total();
    // NUEVA URL (la que te dio la terminal hace un momento)
    // DEBE SER LA URL COMPLETA:
    const urlFirebase = 'https://createpreference-tc6z4zcquq-uc.a.run.app';

    fetch(urlFirebase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Productos Bracasfood',
        price: totalAmount,
        quantity: 1,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error en el servidor de Firebase');
        return res.json();
      })
      .then((data) => {
        if (!data.id) {
          console.error('No se recibió un ID de preferencia:', data);
          return;
        }

        // CAMBIO VITAL: Usa tu PUBLIC_KEY de PRODUCCIÓN (la ves en la ventana amarilla)
        // No uses la que empieza por TEST- porque ya estamos en real.
        const mp = new (window as any).MercadoPago('APP_USR-a4b2b46c-9047-47a1-8d55-6bf852a18759', {
          locale: 'es-CO',
        });
        // CAMBIO VITAL

        mp.checkout({
          preference: { id: data.id },
          autoOpen: true,
        });
      })
      .catch((err) => {
        console.error('Error detallado:', err);
        alert('Hubo un problema al conectar con el pago. Revisa la consola.');
      });
  }
}
