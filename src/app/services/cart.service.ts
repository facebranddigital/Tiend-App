import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  id?: any;
  nombre?: string;
  name?: string;
  precio?: number;
  price?: number;
  cantidad?: number;
  quantity?: number;
  imagen?: string;
  image?: string;
  img?: string;
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

  addToCart(producto: CartItem) {
    this.itemsSignal.update((items) => {
      const idFinal = Date.now().toString() + '_' + Math.random().toString(36).substring(2, 9);
      const cantElegida = producto.cantidad ?? producto.quantity ?? 1;
      const imgValida = producto.imagen ?? producto.image ?? 'assets/bracasfoodlogo.jpeg';

      const nuevoItem: CartItem = {
        ...producto,
        id: idFinal,
        nombre: producto.nombre ?? producto.name ?? 'Producto',
        name: producto.name ?? producto.nombre ?? 'Producto',
        precio: producto.precio ?? producto.price ?? 0,
        price: producto.price ?? producto.precio ?? 0,
        cantidad: cantElegida,
        quantity: cantElegida,
        imagen: imgValida
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
    const items = this.itemsSignal() || [];
    const lineas = items.map((i: CartItem) => {
      const nombre = i.nombre ?? i.name ?? 'Producto';
      const cantidad = i.cantidad ?? i.quantity ?? 1;
      const precio = i.precio ?? i.price ?? 0;
      const subtotal = precio * cantidad;
      return `- ${cantidad}x ${nombre} ($${subtotal})`;
    });
    return lineas.join("\n");
  }
}
