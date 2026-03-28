import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private firestore = inject(Firestore);
  private productsCollection = collection(this.firestore, 'products');

  getProducts(): Observable<Product[]> {
    // Usamos query() para mayor compatibilidad entre versiones de Firebase
    const q = query(this.productsCollection, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  addProduct(product: Product): Promise<any> {
    const productData = {
      ...product,
      createdAt: Timestamp.now()
    };
    return addDoc(this.productsCollection, productData);
  }

  updateProduct(id: string, product: Partial<Product>): Promise<void> {
    const productDocRef = doc(this.firestore, `products/${id}`);
    return updateDoc(productDocRef, product);
  }

  deleteProduct(id: string): Promise<void> {
    const productDocRef = doc(this.firestore, `products/${id}`);
    return deleteDoc(productDocRef);
  }
}
