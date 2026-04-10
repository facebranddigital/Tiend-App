import { Injectable, signal, computed } from '@angular/core';

export interface Product {
  id?: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  description: string;
  stock: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Estado privado reactivo usando Signals
  private cartItems = signal<Product[]>([]);

  // Selectores reactivos
  items = computed(() => this.cartItems());
  count = computed(() => this.cartItems().length);
  total = computed(() => this.cartItems().reduce((acc, item) => acc + item.price, 0));

  addToCart(product: Product) {
    this.cartItems.update(prev => [...prev, product]);
    console.log('Producto añadido al carrito:', product.name);
  }

  removeFromCart(index: number) {
    this.cartItems.update(prev => prev.filter((_, i) => i !== index));
  }

  clearCart() {
    this.cartItems.set([]);
  }
}
