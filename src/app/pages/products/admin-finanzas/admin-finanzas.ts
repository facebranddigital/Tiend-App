import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-finanzas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-finanzas.html',
  styleUrl: './admin-finanzas.scss',
})
export class AdminFinanzasComponent {
  // --- ENTRADAS (Signals) ---
  costoInsumos = signal<number>(0);
  cantidadProducida = signal<number>(1);
  gastoServicios = signal<number>(0);
  otrosGastos = signal<number>(0);
  margenDeseado = signal<number>(40); // 40% por defecto

  // --- CÁLCULOS (Computed - Se actualizan solos) ---
  costoUnitarioMP = computed(() => 
    this.costoInsumos() / (this.cantidadProducida() || 1)
  );

  cifUnitario = computed(() => 
    (this.gastoServicios() + this.otrosGastos()) / (this.cantidadProducida() || 1)
  );

  costoTotalReal = computed(() => 
    this.costoUnitarioMP() + this.cifUnitario()
  );

  precioVentaSugerido = computed(() => {
    const costo = this.costoTotalReal();
    const margen = this.margenDeseado() / 100;
    return costo / (1 - margen);
  });

  gananciaPorUnidad = computed(() => 
    this.precioVentaSugerido() - this.costoTotalReal()
  );
}
