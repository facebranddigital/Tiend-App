import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seguimiento.component.html',
  styleUrls: ['./seguimiento.component.scss'],
})
export class SeguimientoComponent implements OnInit, OnDestroy {
  public pedidoId: string = 'BR-8492'; // ID del pedido en Firestore
  public tiempoEstimado: number = 35;
  public estadoActual: number = 1;

  // Guarda la suscripción para poder cancelarla al salir de la pantalla
  private pedidoSub!: Subscription;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.conectarSeguimientoReal();
  }

  ngOnDestroy(): void {
    // Evita fugas de memoria cancelando la escucha en tiempo real
    if (this.pedidoSub) {
      this.pedidoSub.unsubscribe();
    }
  }

  /**
   * Mantiene el cálculo exacto de la barra para el diseño tipo cómic
   */
  public obtenerPorcentajeProgreso(): number {
    switch (this.estadoActual) {
      case 1: return 0;
      case 2: return 33;
      case 3: return 66;
      case 4: return 100;
      default: return 0;
    }
  }

  /**
   * Se conecta a Firestore y actualiza la pantalla automáticamente 
   * cada vez que cambias el estado en el backend
   */
  private conectarSeguimientoReal(): void {
    this.pedidoSub = this.firebaseService.escucharPedido(this.pedidoId).subscribe({
      next: (pedidoData: any) => {
        // Mapea el texto de Firestore a los números de tu diseño de interfaz
        const mapeoEstados: { [key: string]: number } = {
          'received': 1,
          'preparing': 2,
          'on_the_way': 3,
          'delivered': 4
        };
        
        this.estadoActual = mapeoEstados[pedidoData.status] || 1;
        
        if (pedidoData.estimatedTime) {
          this.tiempoEstimado = pedidoData.estimatedTime;
        }
      },
      error: (err) => {
        console.error('Error al escuchar los cambios del pedido:', err);
      }
    });
  }
}
