import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  // --- ESTADO EDITABLE ---
  insumos = signal<Insumo[]>([{ nombre: 'Insumo', costo: 0 }]);
  produccion = signal<Produccion[]>([{ nombre: 'Producto final', unidades: 0 }]);
  gastoServicios = signal<number>(0);
  ventasTotalesDia = signal<number>(0);

  // --- CÁLCULOS DINÁMICOS ---
  totalInsumos = computed(() => this.insumos().reduce((acc, i) => acc + (i.costo || 0), 0));

  totalUnidades = computed(() => this.produccion().reduce((acc, p) => acc + (p.unidades || 0), 0));

  costoTotalReal = computed(() => this.totalInsumos() + this.gastoServicios());

  costoPorUnidad = computed(() =>
    this.totalUnidades() > 0 ? this.costoTotalReal() / this.totalUnidades() : 0,
  );

  gananciaNetaDia = computed(() => this.ventasTotalesDia() - this.costoTotalReal());

  // --- ACCIONES ---
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
