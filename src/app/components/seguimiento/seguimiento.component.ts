import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
  public pedidoId: string = '';
  public tiempoEstimado: number = 35;
  public estadoActual: number = 1;

  // Coordenadas del Cliente (Tu posición actual)
  public latitud: number | null = null;
  public longitud: number | null = null;
  public errorGps: string = '';

  // Coordenadas del Domiciliario en Tiempo Real
  public deliveryLat: number | null = null;
  public deliveryLng: number | null = null;

  private map!: L.Map;
  private deliveryMarker: any;
  private pedidoSub!: Subscription;
  private watchId: number | null = null;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firebaseService = inject(FirebaseService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    let idDesdeUrl = this.route.snapshot.paramMap.get('id');

    if (!idDesdeUrl || idDesdeUrl === 'orders') {
      idDesdeUrl = localStorage.getItem('ultimoPedidoId');
    }

    if (idDesdeUrl) {
      this.pedidoId = idDesdeUrl;
      localStorage.setItem('ultimoPedidoId', idDesdeUrl);

      setTimeout(() => {
        this.conectarSeguimientoReal();
        this.activarRastreoGps();
      }, 200);
    } else {
      console.warn('Acceso denegado: No se detectó ningún ID de pedido válido.');
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    if (this.pedidoSub) {
      this.pedidoSub.unsubscribe();
    }
    this.apagarRastreoGps();
  }

  private inicializarMapa(latInicial: number, lngInicial: number): void {
    const contenedor = document.getElementById('map-container');
    if (!contenedor || this.map) return;

    const centroInicial: L.LatLngExpression = [latInicial, lngInicial];

    this.map = L.map('map-container', {
      zoomControl: false,
      trackResize: true,
    }).setView(centroInicial, 16);

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

    // ✅ SOLUCIÓN AL MAPA BEIGE: Forzamos a Leaflet a recalcular sus dimensiones
    // en ráfaga para pintar los cuadrantes del mapa en el layout móvil de inmediato
    [100, 300, 600].forEach((delay) => {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, delay);
    });
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

        // Si está en camino (Estado 3), renderizamos y movemos el mapa en tiempo real
        if (this.estadoActual === 3) {
          if (pedidoData.repartidorLat !== undefined && pedidoData.repartidorLng !== undefined) {
            this.deliveryLat = pedidoData.repartidorLat;
            this.deliveryLng = pedidoData.repartidorLng;

            if (this.deliveryLat !== null && this.deliveryLng !== null) {
              const nuevaPos = new L.LatLng(this.deliveryLat, this.deliveryLng);

              if (!this.map) {
                this.inicializarMapa(this.deliveryLat, this.deliveryLng);
              } else {
                if (this.deliveryMarker) {
                  this.deliveryMarker.setLatLng(nuevaPos);
                }
                this.map.panTo(nuevaPos);
              }
            }
          }
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error en el canal de datos de Firestore:', err);

        // MODO TESTING ACTIVO: Forzamos mapa de pruebas en Cali si Firestore no responde
        console.log('Activando mapa de pruebas automático...');
        this.estadoActual = 3;
        this.deliveryLat = 3.4516;
        this.deliveryLng = -76.532;

        setTimeout(() => {
          if (!this.map) {
            this.inicializarMapa(this.deliveryLat!, this.deliveryLng!);
          }
        }, 100);

        this.cdr.detectChanges();
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
          this.cdr.detectChanges();
        },
        (error) => {
          console.warn('Advertencia Geolocalización Cliente:', error.message);
          this.cdr.detectChanges();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    }
  }

  private apagarRastreoGps(): void {
    if (this.watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }
}
