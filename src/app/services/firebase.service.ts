import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, updateDoc, getDoc, docData } from '@angular/fire/firestore'; // 👈 Agregamos 'docData'
import { Auth, authState } from '@angular/fire/auth';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private db = inject(Firestore);
  private auth = inject(Auth);
  private storage = inject(Storage);

  public usuarioActivo$ = authState(this.auth);

  constructor() {}

  /**
   * Obtiene los datos del perfil individual usando la instancia limpia de getDoc
   */
  obtenerPerfilUsuario(uid: string): Observable<any> {
    const docRef = doc(this.db, 'users', uid);
    return from(getDoc(docRef)).pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          return { uid: snapshot.id, ...snapshot.data() };
        }
        return null;
      }),
    );
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
    const extension = archivo.name.split('.').pop();
    const rutaAlmacenamiento = `profiles/${uid}/foto-perfil.${extension}`;
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
   * 🌟 REPARADO: Escucha cambios EN TIEMPO REAL del pedido sin romper instancias.
   * Esto evitará el error en la consola que bloqueaba tu video.
   */
  escucharPedido(orderId: string): Observable<any> {
    const docRef = doc(this.db, 'orders', orderId);
    return docData(docRef, { idField: 'id' }); // 👈 Utiliza la reactividad limpia de AngularFire
  }

  /**
   * Actualiza las coordenadas GPS enviadas por el repartidor
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
