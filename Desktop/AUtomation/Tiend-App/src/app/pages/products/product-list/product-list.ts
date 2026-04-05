import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { Observable } from 'rxjs';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { FooterComponent } from '../../../components/footer/footer';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  products$: Observable<Product[]> = this.productService.getProducts();

  ngOnInit(): void {
    this.products$.subscribe(products => {
      console.log('Productos recibidos:', products);
    });
  }

  onDelete(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productService.deleteProduct(id).then(() => {
        console.log('Producto eliminado');
      }).catch(err => console.error(err));
    }
  }

  getStatusClass(status: string): string {
    return status === 'In Stock' ? 'status-in-stock' : 'status-out-of-stock';
  }
}
