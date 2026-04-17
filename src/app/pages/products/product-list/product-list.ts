import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductListComponent {
  searchText: string = '';
  products$!: Observable<any[]>;

  constructor() {
    // Inicializa tu observable aquí
  }

  getStatusClass(status: string) {
    if (!status) return '';
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

  onDelete(id: string) {
    if (confirm('¿Estás seguro?')) {
      // lógica para eliminar
    }
  }
}
