import { Injectable, inject } from '@angular/core';
// Importaciones optimizadas para la versión modular de Angular Fire
import { Firestore, doc, onSnapshot, DocumentSnapshot, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  // ✅ CORREGIDO: Inyectamos el Firestore global que configuramos en app.config.ts
  private db = inject(Firestore);

  constructor() {}

  /**
   * Escucha un pedido en tiempo real desde Firestore y lo expone como un Observable de RxJS
   */
  escucharPedido(orderId: string): Observable<any> {
    return new Observable((subscriber) => {
      // Apunta a la colección 'orders' usando la instancia inyectada segura
      const docRef = doc(this.db, 'orders', orderId);

      const unsubscribe = onSnapshot(
        docRef,
        (snapshot: DocumentSnapshot) => {
          if (snapshot.exists()) {
            subscriber.next({ id: snapshot.id, ...snapshot.data() });
          } else {
            subscriber.error('Pedido no encontrado');
          }
        },
        (error) => subscriber.error(error),
      );

      return () => unsubscribe();
    });
  }

  /**
   * ✅ NUEVO MÉTODO: Guarda la geolocalización (latitud y longitud) en el pedido de Firestore
   */
  actualizarUbicacionPedido(orderId: string, lat: number, lng: number): Promise<void> {
    const docRef = doc(this.db, 'orders', orderId);
    return updateDoc(docRef, {
      repartidorLat: lat,
      repartidorLng: lng,
      ultimaActualizacion: new Date(),
    });
  }
}
