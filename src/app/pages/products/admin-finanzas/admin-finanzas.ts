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
  // --- ESTADO (Signals: Los datos que el usuario ingresa) ---
  costoInsumos = signal<number>(0);
  cantidadProducida = signal<number>(1);
  gastoServicios = signal<number>(0);
  otrosGastos = signal<number>(0);
  ventasTotalesDia = signal<number>(0);
  gananciaObjetivo = signal<number>(100000);

  // --- LÓGICA DE CÁLCULO (Equivalente a tus Subprocesos de PSeInt) ---

  // 1. Calcular Costo Base (Como tu Subproceso calcularSuperficie)
  costoBaseUnitario = computed(() => {
    const totalGastos = this.costoInsumos() + this.gastoServicios() + this.otrosGastos();
    return totalGastos / (this.cantidadProducida() || 1);
  });

  // 2. Calcular Precio Sugerido (Subproceso para margen del 40%)
  precioSugerido = computed(() => this.costoBaseUnitario() / 0.6);

  // 3. Calcular Ganancia Neta Diaria (Cierre de caja)
  gananciaNetaDia = computed(() => {
    const totalGastos = this.costoInsumos() + this.gastoServicios() + this.otrosGastos();
    return this.ventasTotalesDia() - totalGastos;
  });

  // 4. Calcular Meta (Subproceso: ¿Cuántas unidades vender para ganar X?)
  unidadesParaMeta = computed(() => {
    const gananciaPorUnidad = this.precioSugerido() - this.costoBaseUnitario();
    if (gananciaPorUnidad <= 0) return 0;
    return Math.ceil(this.gananciaObjetivo() / gananciaPorUnidad);
  });
}
