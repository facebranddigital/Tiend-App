import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service'; // Verifica que esta ruta sea la correcta

// 1. Interfaces para el tipado de Bracasfood
interface Insumo {
  nombre: string;
  costo: number;
}
interface Produccion {
  nombre: string;
  unidades: number;
}

@Component({
  selector: 'app-admin-finanzas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-finanzas.html',
  styleUrl: './admin-finanzas.scss',
})
export class AdminFinanzasComponent {
  // --- SERVICIOS ---
  // Inyectamos el AuthService para que el HTML sepa quién es admin
  public auth = inject(AuthService);

  // --- ESTADO EDITABLE (SIGNALS) ---
  insumos = signal<Insumo[]>([{ nombre: 'Insumo', costo: 0 }]);
  produccion = signal<Produccion[]>([{ nombre: 'Producto final', unidades: 0 }]);
  gastoServicios = signal<number>(0);
  ventasTotalesDia = signal<number>(0);

  // --- CÁLCULOS DINÁMICOS AUTOMÁTICOS ---
  totalInsumos = computed(() =>
    this.insumos().reduce((acc: number, i: Insumo) => acc + (i.costo || 0), 0),
  );

  totalUnidades = computed(() =>
    this.produccion().reduce((acc: number, p: Produccion) => acc + (p.unidades || 0), 0),
  );

  costoTotalReal = computed(() => this.totalInsumos() + this.gastoServicios());

  costoPorUnidad = computed(() =>
    this.totalUnidades() > 0 ? this.costoTotalReal() / this.totalUnidades() : 0,
  );

  gananciaNetaDia = computed(() => this.ventasTotalesDia() - this.costoTotalReal());

  // --- ACCIONES PARA AGREGAR O QUITAR FILAS ---
  agregarInsumo() {
    this.insumos.update((v) => [...v, { nombre: '', costo: 0 }]);
  }

  eliminarInsumo(index: number) {
    this.insumos.update((v) => v.filter((_, i) => i !== index));
  }

  agregarProducto() {
    this.produccion.update((v) => [...v, { nombre: '', unidades: 0 }]);
  }

  eliminarProducto(index: number) {
    this.produccion.update((v) => v.filter((_, i) => i !== index));
  }
}
