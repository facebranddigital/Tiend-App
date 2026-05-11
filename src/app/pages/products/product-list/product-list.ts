import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router'; // Import unificado
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  
  private searchSubject = new BehaviorSubject<string>('');
  products$!: Observable<any[]>;

  ngOnInit() {
    // 1. Escuchar parámetros de la URL (Categorías)
    this.route.queryParams.subscribe(params => {
      const category = params['category'];
      if (category) {
        this.searchSubject.next(category);
      }
    });

    // 2. Definir el flujo de datos
    const allProducts$ = this.productService.getProducts();
    const filter$ = this.searchSubject.asObservable().pipe(startWith(''));

    // 3. Combinar productos y filtro en un solo flujo
    this.products$ = combineLatest([allProducts$, filter$]).pipe(
      map(([products, filterString]) => {
        if (!products) return [];
        if (!filterString) return products;
        
        const search = filterString.toLowerCase();
        
        return products.filter((product: any) => {
          // Busca coincidencia en Nombre O en Categoría
          return product.name?.toLowerCase().includes(search) ||
                 product.category?.toLowerCase().includes(search)
        });
      })
    );
  }

  // --- MÉTODOS DE APOYO ---

  onSearch(text: string) {
    this.searchSubject.next(text);
  }

  getStatusClass(status: string) {
    if (!status) return 'status-default';
    const s = status.toLowerCase().trim();
    if (s === 'activo' || s === 'disponible' || s === 'in stock') return 'status-in-stock';
    if (s === 'agotado' || s === 'sin stock' || s === 'out of stock') return 'status-out-of-stock';
    return 'status-default';
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

  async onDelete(id: string) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await this.productService.deleteProduct(id);
      } catch (error) {
        console.error('Error al borrar:', error);
      }
    }
  }
}
