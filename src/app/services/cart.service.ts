import { Injectable, signal, computed } from '@angular/core';

export interface Product {
  id?: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  description?: string; // Lo pongo opcional por si acaso
  stock?: number;       // Lo pongo opcional por si acaso
  quantity?: number;    // <--- AÑADE ESTA LÍNEA AQUÍ
}


@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Estado privado reactivo usando Signals
  public cartItems = signal<Product[]>([]);

  // Selectores reactivos
  items = computed(() => this.cartItems());
  // Suma todas las unidades (ej: 2 bolis + 1 papa = 3)
count = computed(() => this.cartItems().reduce((acc, item) => acc + (item.quantity || 1), 0));

// Calcula el precio total multiplicando por la cantidad
total = computed(() => this.cartItems().reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0));

  addToCart(newProduct: Product) {
  this.cartItems.update(items => {
    // Buscamos si el producto ya está en el carrito por su nombre
    const existingItem = items.find(item => item.name === newProduct.name);

    if (existingItem) {
      // Si existe, creamos un nuevo array con la cantidad actualizada
      return items.map(item =>
        item.name === newProduct.name
          ? { ...item, quantity: (item.quantity || 0) + (newProduct.quantity || 1) }
          : item
      );
    }
    // Si no existe, lo añadimos al array
    return [...items, newProduct];
  });
}

  removeFromCart(index: number) {
    this.cartItems.update(prev => prev.filter((_, i) => i !== index));
  }

  clearCart() {
    this.cartItems.set([]);
  }
}
