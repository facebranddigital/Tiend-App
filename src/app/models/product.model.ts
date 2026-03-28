export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: 'In Stock' | 'Out of Stock';
  imageUrl: string;
  createdAt?: any;
}
