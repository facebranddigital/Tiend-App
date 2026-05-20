import { Injectable, inject } from '@angular/core';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { updateDoc } from '@firebase/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private db = inject(Firestore);

  constructor() {}

  /**
   * Escucha un pedido en tiempo real de forma segura y sin conflictos de tipos
   */
  escucharPedido(orderId: string): Observable<any> {
    return new Observable((subscriber) => {
      const docRef = doc(this.db, 'orders', orderId);

      // Usamos onSnapshot directamente vinculado a la referencia nativa
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            subscriber.next({ id: snapshot.id, ...snapshot.data() });
          } else {
            subscriber.error('Pedido no encontrado');
          }
        },
        (error) => subscriber.error(error)
      );

      return () => unsubscribe();
    });
  }

  /**
   * Guarda la geolocalización en el pedido de Firestore
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
