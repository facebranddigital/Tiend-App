import { Injectable, signal, computed } from '@angular/core';

// 1. Modificamos el id para que sea opcional (?); así TypeScript no se queja en landing.ts
export interface CartItem {
  id?: any;
  nombre?: string;
  name?: string;
  precio?: number;
  price?: number;
  cantidad?: number;
  quantity?: number;
  imagen?: string;
  category?: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private itemsSignal = signal<CartItem[]>([]);

  public cartItems = this.itemsSignal.asReadonly();
  public items = this.itemsSignal.asReadonly();

  public totalPagar = computed(() => {
    return this.itemsSignal().reduce((acc, item) => {
      const precio = item.precio ?? item.price ?? 0;
      const cantidad = item.cantidad ?? item.quantity ?? 1;
      return acc + precio * cantidad;
    }, 0);
  });

  public total = this.totalPagar;

  public count = computed(() => {
    return this.itemsSignal().reduce((acc, item) => acc + (item.cantidad ?? item.quantity ?? 1), 0);
  });

  // 2. Método blindado que procesa y repara objetos incompletos que vengan de la landing
  addToCart(producto: CartItem) {
    this.itemsSignal.update((items) => {
      // Si el producto no tiene ID, usamos su nombre como ID único temporal o generamos uno alternativo
      const idFinal = producto.id ?? producto.name ?? producto.nombre ?? Math.random().toString();

      const exist = items.find((i) => i.id === idFinal);

      if (exist) {
        return items.map((i) => {
          if (i.id === idFinal) {
            const nuevaCant = (i.cantidad ?? i.quantity ?? 1) + 1;
            return { ...i, cantidad: nuevaCant, quantity: nuevaCant };
          }
          return i;
        });
      }

      const nuevoItem: CartItem = {
        ...producto,
        id: idFinal, // Asignamos el ID resuelto
        nombre: producto.nombre ?? producto.name ?? 'Producto',
        name: producto.name ?? producto.nombre ?? 'Producto',
        precio: producto.precio ?? producto.price ?? 0,
        price: producto.price ?? producto.precio ?? 0,
        cantidad: producto.cantidad ?? producto.quantity ?? 1,
        quantity: producto.quantity ?? producto.cantidad ?? 1,
      };
      return [...items, nuevoItem];
    });
  }

  removeFromCart(id: any) {
    this.itemsSignal.update((items) => items.filter((i) => i.id !== id));
  }

  clearCart() {
    this.itemsSignal.set([]);
  }
  limpiarCarrito() {
    this.clearCart();
  }

  obtenerTextoPedido(idUnico: string): string {
    // 1. Mapeamos cada producto con un formato limpio y emoji de comida
    const lineas = this.itemsSignal().map((i) => {
      const nombre = i.nombre ?? i.name ?? 'Producto';
      const cantidad = i.cantidad ?? i.quantity ?? 1;
      const precio = i.precio ?? i.price ?? 0;
      const subtotal = precio * cantidad;

      return `🔸 *${nombre}* (x${cantidad}) -> _$${subtotal.toLocaleString()}_`;
    });

    // 2. Armamos la estructura final del mensaje usando saltos de línea claros
    return [
      `🔥 *¡NUEVO PEDIDO BRACASFOOD!* 🔥`,
      `=========================`,
      `🆔 *Orden:* #${idUnico}`,
      `⏰ *Fecha:* ${new Date().toLocaleDateString()}`,
      `=========================`,
      `🛒 *DETALLE DEL PEDIDO:*`,
      ...lineas,
      `=========================`,
      `💰 *TOTAL A PAGAR:* $${this.totalPagar().toLocaleString()}`,
      `=========================`,
      `🛵 _Por favor, confírmame el tiempo estimado de entrega._`,
    ].join('\n');
  }
}
