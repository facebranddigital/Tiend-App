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

  // --- VARIABLES PARA EL BOTÓN DE WHATSAPP ---
  showErrorHelp = signal(false);
  whatsappNumber = '573001234567'; // Sin el símbolo +

  paymentMethods = ['Mercado Pago', 'Tarjeta de Crédito'];
  selectedPaymentMethod = signal('Mercado Pago');
  total = computed(() => this.cartService.total());

  // Función para generar el link dinámico de WhatsApp
  getWhatsAppUrl() {
    const totalMsg = this.total().toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });

    const text = this.showErrorHelp()
      ? `¡Hola! Tuve un problema al pagar mi pedido de ${totalMsg} en la web de BracasFood. ¿Me ayudan?`
      : `Hola BracasFood! Quiero pedir mi carrito de ${totalMsg}.`;

    // CORREGIDO: Uso de backticks (``) y sintaxis ${} correcta
    return `https://wa.me{this.whatsappNumber}?text=${encodeURIComponent(text)}`;
  }

  onCheckout() {
    this.showErrorHelp.set(false);
    const totalAmount = this.total();
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
        if (!res.ok) throw new Error('Error en el servidor');
        return res.json();
      })
      .then((data) => {
        // Inicialización de Mercado Pago
        const mp = new (window as any).MercadoPago('APP_USR-a4b2b46c-9047-47a1-8d55-6bf852a18759', {
          locale: 'es-CO',
        });
        mp.checkout({
          preference: { id: data.id },
          autoOpen: true,
        });
      })
      .catch((err) => {
        console.error('Error detallado:', err);
        // Si hay error en la conexión o el servidor, activamos la alerta visual
        this.showErrorHelp.set(true);
      });
  }

  onDelete(index: number) {
    this.cartService.removeFromCart(index);
  }

  onClear() {
    this.cartService.clearCart();
  }

  onSelectMethod(method: string) {
    this.selectedPaymentMethod.set(method);
  }
}
