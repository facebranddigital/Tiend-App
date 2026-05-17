import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, DocumentSnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Ajusta según donde tengas tus keys

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app = initializeApp(environment.firebaseConfig);
  private db = getFirestore(this.app);

  constructor() {}

  /**
   * Escucha un pedido en tiempo real desde Firestore y lo expone como un Observable de RxJS
   */
  escucharPedido(orderId: string): Observable<any> {
    return new Observable((subscriber) => {
      const docRef = doc(this.db, 'orders', orderId);

      // Listener en tiempo real de Firestore
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot: DocumentSnapshot) => {
          if (snapshot.exists()) {
            subscriber.next({ id: snapshot.id, ...snapshot.data() });
          } else {
            subscriber.error('Pedido no encontrado');
          }
        },
        (error) => subscriber.error(error)
      );

      // Se ejecuta al desuscribirse para evitar fugas de memoria
      return () => unsubscribe();
    });
  }
}
