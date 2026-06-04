import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private db = inject(Firestore);
  private auth = inject(Auth);
  private storage = inject(Storage);

  // Mantenemos este canal activo para el login de usuario
  public usuarioActivo$ = authState(this.auth);

  constructor() {}

  /**
   * Perfil de usuario con SDK puro nativo. 
   * Esto elimina por completo el error de Injection Context.
   */
  obtenerPerfilUsuario(uid: string): Observable<any> {
    return new Observable((subscriber) => {
      const docRef = doc(this.db, 'users', uid);
      
      // onSnapshot nativo es inmune a los errores de Injection Context de Angular
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            subscriber.next({ uid: snapshot.id, ...snapshot.data() });
          } else {
            subscriber.next(null);
          }
        },
        (error) => {
          console.error('Error en onSnapshot de Perfil:', error);
          subscriber.error(error);
        }
      );
      
      // Evita fugas de memoria cancelando la escucha al destruir el componente
      return () => unsubscribe();
    });
  }

  /**
   * Guarda o actualiza la información del perfil del usuario
   */
  guardarPerfilUsuario(uid: string, datos: any): Promise<void> {
    const docRef = doc(this.db, 'users', uid);
    return setDoc(docRef, { uid, ...datos }, { merge: true });
  }

  /**
   * Sube una foto a Firebase Storage y retorna su URL pública
   */
  async subirFotoPerfil(uid: string, archivo: File): Promise<string> {
    const rutaAlmacenamiento = `profiles/${uid}/${archivo.name}`;
    const referenciaStorage = ref(this.storage, rutaAlmacenamiento);
    await uploadBytes(referenciaStorage, archivo);
    return await getDownloadURL(referenciaStorage);
  }

  /**
   * Vincula el ID del último pedido realizado al perfil del usuario
   */
  async vincularPedidoAUsuario(uid: string, orderId: string): Promise<void> {
    const docRef = doc(this.db, 'users', uid);
    return updateDoc(docRef, {
      ultimoPedidoId: orderId,
      fechaUltimoPedido: new Date(),
    });
  }

  /**
   * Crea un nuevo documento de pedido en la colección 'orders'
   */
  crearPedido(orderId: string, datos: any): Promise<void> {
    const docRef = doc(this.db, 'orders', orderId);
    return setDoc(docRef, datos);
  }

  /**
   * Escucha un pedido en tiempo real con SDK puro.
   * Ideal para actualizar la posición en mapas sin cortes ni cuelgues.
   */
  escucharPedido(orderId: string): Observable<any> {
    return new Observable((subscriber) => {
      const docRef = doc(this.db, 'orders', orderId);
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            subscriber.next({ id: snapshot.id, ...snapshot.data() });
          } else {
            subscriber.next(null);
          }
        },
        (error) => {
          console.error('Error en onSnapshot de Pedido:', error);
          subscriber.error(error);
        }
      );
      return () => unsubscribe();
    });
  }

  /**
   * Actualiza las coordenadas GPS en tiempo real enviadas por el repartidor
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
