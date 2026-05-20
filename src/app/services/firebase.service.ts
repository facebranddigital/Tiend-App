import { Injectable, inject } from '@angular/core';
import { Firestore, doc, onSnapshot, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth, authState, user } from '@angular/fire/auth'; // ✅ Manejo de autenticación nativa
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage'; // ✅ Manejo de imágenes nativo
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private db = inject(Firestore);
  private auth = inject(Auth); // ✅ Inyección de autenticación
  private storage = inject(Storage); // ✅ Inyección de almacenamiento de imágenes

  // Opciones reactivas para saber el estado del usuario en tiempo real
  public usuarioActivo$ = authState(this.auth);

  constructor() {}

  /**
   * Obtiene los datos del perfil del usuario logueado desde Firestore
   */
  obtenerPerfilUsuario(uid: string): Observable<any> {
    const docRef = doc(this.db, 'users', uid);
    return new Observable((subscriber) => {
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            subscriber.next(snapshot.data());
          } else {
            subscriber.next(null);
          }
        },
        (error) => subscriber.error(error),
      );
      return () => unsubscribe();
    });
  }

  /**
   * Crea o actualiza el documento del perfil de usuario en la colección 'users'
   */
  guardarPerfilUsuario(uid: string, datos: any): Promise<void> {
    const docRef = doc(this.db, 'users', uid);
    return setDoc(docRef, { uid, ...datos }, { merge: true }); // Usamos merge para no borrar campos antiguos
  }

  /**
   * Sube una imagen a Firebase Storage y retorna su URL pública de descarga
   */
  async subirFotoPerfil(uid: string, archivo: File): Promise<string> {
    const rutaAlmacenamiento = `profiles/${uid}/${archivo.name}`;
    const referenciaStorage = ref(this.storage, rutaAlmacenamiento);

    // Subimos el archivo binario
    await uploadBytes(referenciaStorage, archivo);

    // Retornamos la URL de internet de la foto
    return await getDownloadURL(referenciaStorage);
  }

  /**
   * Vincula de forma permanente el último pedido generado al perfil del usuario en Firestore
   */
  async vincularPedidoAUsuario(uid: string, orderId: string): Promise<void> {
    const docRef = doc(this.db, 'users', uid);
    return updateDoc(docRef, {
      ultimoPedidoId: orderId,
      fechaUltimoPedido: new Date(),
    });
  }

  /**
   * Crea un nuevo pedido en la colección 'orders' de Firestore
   */
  crearPedido(orderId: string, datos: any): Promise<void> {
    const docRef = doc(this.db, 'orders', orderId);
    return setDoc(docRef, datos);
  }

  /**
   * Escucha un pedido en tiempo real de forma segura y sin conflictos de tipos
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
            subscriber.error('Pedido no encontrado');
          }
        },
        (error) => subscriber.error(error),
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
