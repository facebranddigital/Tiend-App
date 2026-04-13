import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Estado global del carrito
  cartItems = signal<any[]>([]);

  constructor() {}

  // Método para agregar productos
  addToCart(product: any) {
    this.cartItems.update(prev => [...prev, product]);
  }

  // Método para limpiar (útil después de pagar con Mercado Pago)
  clearCart() {
    this.cartItems.set([]);
  }
}