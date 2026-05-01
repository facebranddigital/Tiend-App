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
  onSnapshot,
  CollectionReference,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private firestore = inject(Firestore);
  private productsCollection = collection(
    this.firestore,
    'products',
  ) as CollectionReference<Product>;

  getProducts(): Observable<Product[]> {
    return new Observable<Product[]>((subscriber) => {
      const q = query(this.productsCollection, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const products = snapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              }) as Product,
          );
          subscriber.next(products);
        },
        (error) => subscriber.error(error),
      );
      return () => unsubscribe();
    });
  }

  getProductById(id: string): Observable<Product> {
    const productDocRef = doc(this.firestore, `products/${id}`);
    return new Observable<Product>((subscriber) => {
      return onSnapshot(productDocRef, (snapshot) => {
        if (snapshot.exists()) {
          subscriber.next({ id: snapshot.id, ...snapshot.data() } as Product);
        }
      });
    });
  }

  addProduct(product: Product): Promise<any> {
    return addDoc(this.productsCollection, { ...product, createdAt: Timestamp.now() });
  }

  updateProduct(id: string, product: Partial<Product>): Promise<void> {
    return updateDoc(doc(this.firestore, `products/${id}`), product);
  }

  deleteProduct(id: string): Promise<void> {
    return deleteDoc(doc(this.firestore, `products/${id}`));
  }
}
