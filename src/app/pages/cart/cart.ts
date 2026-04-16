import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart';
import { environment } from '../../../environments/environment';

declare var MercadoPago: any;

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class CartComponent {
  paymentMethods = ['Mercado Pago', 'Tarjeta de Crédito'];
  selectedPaymentMethod = signal('Mercado Pago');
  paymentSuccess = signal(false);

  constructor(public cartService: CartService) {}

  total = computed(() => {
    return this.cartService.cartItems().reduce((acc, item) => acc + item.price, 0);
  });

  onDelete(index: number) {
    this.cartService.cartItems.update((prev) => prev.filter((_, i) => i !== index));
  }

  onClear() {
    this.cartService.clearCart();
  }

  onSelectMethod(method: string) {
    this.selectedPaymentMethod.set(method);
  }

  onCheckout() {
  const totalAmount = this.total();
  const urlFirebase = 'https://us-central1-tiend-app.cloudfunctions.net/createPreference';

  fetch(urlFirebase, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Productos Tiend-App',
      price: totalAmount,
      quantity: 1,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error('Error en el servidor de Firebase');
      return res.json();
    })
    .then((data) => {
      // VALIDACIÓN CLAVE: Si data.id no existe, el SDK dará error 404
      if (!data.id) {
        console.error('No se recibió un ID de preferencia:', data);
        return;
      }

      console.log('ID recibido con éxito:', data.id);

      const mp = new (window as any).MercadoPago(environment.mercadoPagoPublicKey, {
        locale: 'es-CO',
      });

      // Aseguramos que el objeto preference solo tenga el ID
      mp.checkout({
        preference: {
          id: data.id
        },
        autoOpen: true
      });
    })
    .catch((err) => {
      console.error('Error detallado:', err);
    });
    }
    }
