import { Injectable, signal, computed, effect } from '@angular/core'; // 1. Añadimos effect

export interface Product {
  id?: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  description?: string;
  stock?: number;
  quantity?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // 2. Cargamos los datos del LocalStorage al arrancar
  private initialItems: Product[] = JSON.parse(localStorage.getItem('cart_bracas') || '[]');

  // 3. Inicializamos la señal con lo que encontramos en el storage
  public cartItems = signal<Product[]>(this.initialItems);

  constructor() {
    // 4. Cada vez que cartItems cambie, se guarda automáticamente
    effect(() => {
      localStorage.setItem('cart_bracas', JSON.stringify(this.cartItems()));
    });
  }

  // Selectores reactivos
  items = computed(() => this.cartItems());
  count = computed(() => this.cartItems().reduce((acc, item) => acc + (item.quantity || 1), 0));
  total = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.price * (item.quantity || 1), 0),
  );

  addToCart(newProduct: Product) {
    this.cartItems.update((items) => {
      const existingItem = items.find((item) => item.name === newProduct.name);
      if (existingItem) {
        return items.map((item) =>
          item.name === newProduct.name
            ? { ...item, quantity: (item.quantity || 0) + (newProduct.quantity || 1) }
            : item,
        );
      }
      return [...items, { ...newProduct, quantity: newProduct.quantity || 1 }];
    });
  }

  removeFromCart(index: number) {
    this.cartItems.update((prev) => prev.filter((_, i) => i !== index));
  }

  clearCart() {
    this.cartItems.set([]);
  }
}
