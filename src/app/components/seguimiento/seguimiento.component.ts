import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // ✅ 1. IMPORTACIÓN DINÁMICA DE RUTAS
import { FirebaseService } from '../../services/firebase.service';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seguimiento.component.html',
  styleUrls: ['./seguimiento.component.scss'],
})
export class SeguimientoComponent implements OnInit, OnDestroy {
  // ✅ 2. EL ID YA NO ES FIJO: Se inicializa vacío y se llena dinámicamente
  public pedidoId: string = '';
  public tiempoEstimado: number = 35;
  public estadoActual: number = 1;

  public latitud: number | null = null;
  public longitud: number | null = null;
  public errorGps: string = '';

  public deliveryLat: number | null = null;
  public deliveryLng: number | null = null;

  private map!: L.Map;
  private deliveryMarker: any;
  private pedidoSub!: Subscription;
  private watchId: number | null = null;

  // ✅ 3. INYECCIÓN DEL LECTOR DE PARÁMETROS DE LA URL
  private route = inject(ActivatedRoute);
  private firebaseService = inject(FirebaseService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    // ✅ 4. ATRACO DE ID: Captura el código enviado en la URL (ej: /seguimiento/BR-1111)
    // Si no encuentra ninguno, usa el de respaldo 'BR-8492' para que no se rompa en tus pruebas actuales.
    this.pedidoId = this.route.snapshot.paramMap.get('id') || 'BR-8492';

    setTimeout(() => {
      this.conectarSeguimientoReal();
      this.activarRastreoGps();
    }, 200);
  }

  ngOnDestroy(): void {
    if (this.pedidoSub) {
      this.pedidoSub.unsubscribe();
    }
    this.apagarRastreoGps();
  }

  private inicializarMapa(): void {
    const contenedor = document.getElementById('map-container');
    if (!contenedor || this.map) return;

    const centroInicial: L.LatLngExpression = [3.4516, -76.532];
    this.map = L.map('map-container', { zoomControl: false }).setView(centroInicial, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Bracasfood Tracker',
    }).addTo(this.map);

    this.deliveryMarker = L.circleMarker(centroInicial, {
      radius: 10,
      fillColor: '#ff6b00',
      color: '#000000',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.9,
    }).addTo(this.map);
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

        if (this.estadoActual === 3) {
          setTimeout(() => {
            this.inicializarMapa();

            if (pedidoData.repartidorLat && pedidoData.repartidorLng) {
              this.deliveryLat = pedidoData.repartidorLat;
              this.deliveryLng = pedidoData.repartidorLng;

              if (
                this.map &&
                this.deliveryMarker &&
                this.deliveryLat !== null &&
                this.deliveryLng !== null
              ) {
                const nuevaPos = new L.LatLng(this.deliveryLat, this.deliveryLng);
                this.deliveryMarker.setLatLng(nuevaPos);
                this.map.panTo(nuevaPos);
              }
            }
          }, 100);
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error en el canal de datos de Firestore:', err);
      },
    });
  }

  private activarRastreoGps(): void {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.latitud = position.coords.latitude;
          this.longitud = position.coords.longitude;
          this.errorGps = '';
          console.log(`Coordenadas Bracasfood: Lat ${this.latitud}, Lng ${this.longitud}`);
          this.cdr.detectChanges();
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
          enableHighAccuracy: true,
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
