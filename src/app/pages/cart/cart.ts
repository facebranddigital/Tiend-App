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
    const urlFirebase = 'https://us-central1-tiend-app.cloudfunctions.net/createPreference';

    fetch(urlFirebase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Productos Bracasfood', // Cambiado para tu marca
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

        const mp = new (window as any).MercadoPago('TEST-1a7af8d6-a414-4308-ba67-bd36d379818b', {
          locale: 'es-CO',
        });

        mp.checkout({
          preference: { id: data.id },
          autoOpen: true,
        });
      })
      .catch((err) => {
        console.error('Error detallado:', err);
      });
  }
} // <--- ESTA LLAVE CIERRA LA CLASE (Asegúrate de que esté al final)
