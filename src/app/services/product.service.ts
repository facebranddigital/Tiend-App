import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  collectionData,
  docData,
  CollectionReference,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private firestore = inject(Firestore);

  // ✅ CORREGIDO: Se genera la referencia dentro de un método para asegurar el contexto de inyección activo
  private obtenerColeccionProductos(): CollectionReference<Product> {
    return collection(this.firestore, 'products') as CollectionReference<Product>;
  }

  getProducts(): Observable<Product[]> {
    const q = query(this.obtenerColeccionProductos(), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  getProductById(id: string): Observable<Product> {
    const productDocRef = doc(this.firestore, `products/${id}`);
    return docData(productDocRef, { idField: 'id' }) as Observable<Product>;
  }

  addProduct(product: Product): Promise<any> {
    return addDoc(this.obtenerColeccionProductos(), { ...product, createdAt: Timestamp.now() });
  }

  updateProduct(id: string, product: Partial<Product>): Promise<void> {
    return updateDoc(doc(this.firestore, `products/${id}`), product);
  }

  deleteProduct(id: string): Promise<void> {
    return deleteDoc(doc(this.firestore, `products/${id}`));
  }
}
