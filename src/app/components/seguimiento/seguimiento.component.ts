import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
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
  public pedidoId: string = 'BR-8492';
  public tiempoEstimado: number = 35;
  public estadoActual: number = 1;

  // Variables para almacenar la posición del repartidor o cliente en la UI
  public latitud: number | null = null;
  public longitud: number | null = null;
  public errorGps: string = '';

  private pedidoSub!: Subscription;
  private watchId: number | null = null; // Guarda el identificador del GPS en tiempo real

  // Inyecciones modernas mediante inject() compatibles con Contexto de Angular Standalone
  private firebaseService = inject(FirebaseService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.conectarSeguimientoReal();
    this.activarRastreoGps(); // Arranca el monitoreo geolocalizado de forma segura
  }

  ngOnDestroy(): void {
    if (this.pedidoSub) {
      this.pedidoSub.unsubscribe();
    }
    this.apagarRastreoGps(); // Apaga el sensor GPS al destruir el componente para ahorrar batería
  }

  public obtenerPorcentajeProgreso(): number {
    switch (this.estadoActual) {
      case 1:
        return 0;
      case 2:
        return 33;
      case 3:
        return 66;
      case 4:
        return 100;
      default:
        return 0;
    }
  }

  private conectarSeguimientoReal(): void {
    this.pedidoSub = this.firebaseService.escucharPedido(this.pedidoId).subscribe({
      next: (pedidoData: any) => {
        if (!pedidoData) return;

        const mapeoEstados: { [key: string]: number } = {
          received: 1,
          preparing: 2,
          on_the_way: 3,
          delivered: 4,
        };

        this.estadoActual = mapeoEstados[pedidoData.status] || 1;

        if (pedidoData.estimatedTime) {
          this.tiempoEstimado = pedidoData.estimatedTime;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error en el canal de datos de Firestore:', err);
      },
    });
  }

  /**
   * Activa el sensor de geolocalización nativo en tiempo real
   */
  private activarRastreoGps(): void {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      // watchPosition se ejecuta automáticamente cada vez que el dispositivo cambia de coordenadas
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.latitud = position.coords.latitude;
          this.longitud = position.coords.longitude;
          this.errorGps = '';

          console.log(`Coordenadas Bracasfood: Lat ${this.latitud}, Lng ${this.longitud}`);

          // Opcional: Envía las coordenadas GPS dinámicamente a Firestore
          this.firebaseService
            .actualizarUbicacionPedido(this.pedidoId, this.latitud, this.longitud)
            .catch((err) => console.error('Error guardando coordenadas en la BD:', err));

          this.cdr.detectChanges(); // Sincroniza la UI
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              this.errorGps = 'Acceso al GPS denegado por el usuario o falta de entorno HTTPS.';
              break;
            case error.POSITION_UNAVAILABLE:
              this.errorGps = 'La señal de geolocalización no está disponible.';
              break;
            case error.TIMEOUT:
              this.errorGps = 'Tiempo de espera agotado al leer el GPS.';
              break;
          }
          console.warn('Advertencia Geolocalización:', this.errorGps);
          this.cdr.detectChanges();
        },
        {
          enableHighAccuracy: true, // Fuerza el uso de GPS satelital de alta precisión
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } else {
      this.errorGps = 'Tu navegador web no soporta servicios de geolocalización.';
    }
  }

  private apagarRastreoGps(): void {
    if (this.watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }
}
