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

  public latitud: number | null = null;
  public longitud: number | null = null;
  public errorGps: string = '';

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
    // 1. Intentamos capturar el parámetro ID directo de la URL activa
    let idDesdeUrl = this.route.snapshot.paramMap.get('id');

    // 2. RECUPERACIÓN INTELIGENTE: Si la URL dice 'orders', viene vacía o se refresca la página,
    // rescatamos el ID real guardado por el carrito en la memoria del navegador.
    if (!idDesdeUrl || idDesdeUrl === 'orders') {
      idDesdeUrl = localStorage.getItem('ultimoPedidoId');
    }

    if (idDesdeUrl) {
      this.pedidoId = idDesdeUrl;

      // Aseguramos que se mantenga guardado en el navegador por si vuelve a actualizar
      localStorage.setItem('ultimoPedidoId', idDesdeUrl);

      setTimeout(() => {
        this.conectarSeguimientoReal();
        this.activarRastreoGps();
      }, 200);
    } else {
      console.warn(
        'Acceso denegado: No se detectó ningún ID de pedido válido en la URL ni en memoria.',
      );
      // Si de verdad no hay ningún pedido activo en este navegador, redirige al home de forma segura
      this.router.navigate(['/']);
    }
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
          this.cdr.detectChanges();
        },
        (error) => {
          console.warn('Advertencia Geolocalización:', error.message);
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
