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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firebaseService = inject(FirebaseService);
  private cdr = inject(ChangeDetectorRef);

  public pedidoId: string = '';
  public tiempoEstimado: number = 35;
  
  // SOLUCIÓN AL ERROR DE TIPADO: Inicializado estrictamente como una cadena de texto
  public estadoActual: string = 'received';

  public latitud: number | null = null;
  public longitud: number | null = null;
  public errorGps: string = '';

  public deliveryLat: number | null = null;
  public deliveryLng: number | null = null;

  private map!: L.Map;
  private deliveryMarker: any;
  private pedidoSub!: Subscription;
  private watchId: number | null = null;

  ngOnInit(): void {
    let idDesdeUrl = this.route.snapshot.paramMap.get('id');

    if (idDesdeUrl === 'orders' || idDesdeUrl === 'null' || idDesdeUrl === 'undefined') {
      idDesdeUrl = null;
    }

    if (idDesdeUrl && idDesdeUrl.length > 5) {
      this.pedidoId = idDesdeUrl;
      localStorage.setItem('ultimoPedidoId', idDesdeUrl);
      this.conectarSeguimientoReal();
      return;
    }

    this.firebaseService.usuarioActivo$.subscribe({
      next: (user) => {
        if (user) {
          this.firebaseService.obtenerPerfilUsuario(user.uid).subscribe({
            next: (perfil) => {
              if (perfil && perfil.ultimoPedidoId) {
                this.pedidoId = perfil.ultimoPedidoId;
                localStorage.setItem('ultimoPedidoId', perfil.ultimoPedidoId);
                this.conectarSeguimientoReal();
              } else {
                this.usarIdRespaldoLocal();
              }
            },
            error: () => this.usarIdRespaldoLocal(),
          });
        } else {
          this.usarIdRespaldoLocal();
        }
      },
      error: () => this.usarIdRespaldoLocal(),
    });
  }

  private usarIdRespaldoLocal(): void {
    const ultimoIdValido = localStorage.getItem('ultimoPedidoId');
    if (ultimoIdValido && ultimoIdValido !== '3236111165' && ultimoIdValido !== 'null') {
      this.pedidoId = ultimoIdValido;
    } else {
      this.pedidoId = '3236111165';
    }
    this.conectarSeguimientoReal();
  }

  public iniciarGpsManual(): void {
    this.activarRastreoGps();
  }

  ngOnDestroy(): void {
    if (this.pedidoSub) this.pedidoSub.unsubscribe();
    this.apagarRastreoGps();
  }

  private apagarRastreoGps(): void {
    if (this.watchId !== null && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  private inicializarMapa(latInicial: number, lngInicial: number): void {
    const contenedor = document.getElementById('map-container');
    if (!contenedor || this.map) return;

    this.map = L.map('map-container', { zoomControl: true, trackResize: true }).setView([latInicial, lngInicial], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.deliveryMarker = L.circleMarker([latInicial, lngInicial], {
      radius: 12,
      fillColor: '#ff6b00',
      color: '#ffffff',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.9,
    }).addTo(this.map);

    [100, 300, 600, 1000].forEach((delay) => {
      setTimeout(() => { if (this.map) this.map.invalidateSize(); }, delay);
    });
  }

  /**
   * Sincronizado exactamente con los porcentajes numéricos del backend (Java)
   */
  public obtenerPorcentajeProgreso(): number {
    if (!this.estadoActual) return 0;
    
    switch (this.estadoActual) {
      case 'received': return 0;
      case 'preparing': return 33;
      case 'on_the_way': return 66; 
      case 'delivered': return 100;
      default: return 0;
    }
  }

  private conectarSeguimientoReal(): void {
    if (this.pedidoSub) this.pedidoSub.unsubscribe();

    if (!this.pedidoId || this.pedidoId === 'null') {
      this.activarSimulacionDesarrollo();
      return;
    }

    this.pedidoSub = this.firebaseService.escucharPedido(this.pedidoId).subscribe({
      next: (pedidoData: any) => {
        if (!pedidoData) {
          this.activarSimulacionDesarrollo();
          return;
        }

        // CORREGIDO (Línea 166): Se remueve el mapeo intermedio. Se almacena el texto puro de Firestore.
        this.estadoActual = pedidoData.status || 'received';
        
        if (pedidoData.estimatedTime) this.tiempoEstimado = pedidoData.estimatedTime;

        const latValida = pedidoData.repartidorLat ?? 3.4516;
        const lngValida = pedidoData.repartidorLng ?? -76.532;
        
        this.deliveryLat = latValida;
        this.deliveryLng = lngValida;

        // Gestión asíncrona del ciclo de vida del mapa
        if (!this.map) {
          this.inicializarMapa(latValida, lngValida);
        } else {
          const nuevaPos = new L.LatLng(latValida, lngValida);
          if (this.deliveryMarker) {
            this.deliveryMarker.setLatLng(nuevaPos);
          }
          this.map.setView(nuevaPos, this.map.getZoom(), { animate: true });
        }
        this.cdr.detectChanges();
      },
      error: () => this.activarSimulacionDesarrollo(),
    });
  }

  private activarSimulacionDesarrollo(): void {
    if (!this.pedidoId || this.pedidoId === 'null') this.pedidoId = 'BR-LOCAL-TEST';
    
    // CORREGIDO (Línea 194): Cambiado el número 3 por la cadena correspondiente para evitar errores de compilación
    this.estadoActual = 'on_the_way'; 
    this.tiempoEstimado = 25;
    
    const latSimulada = 3.4516;
    const lngSimulada = -76.532;
    
    this.deliveryLat = latSimulada;
    this.deliveryLng = lngSimulada;

    if (!this.map) {
      this.inicializarMapa(latSimulada, lngSimulada);
    } else {
      const nuevaPos = new L.LatLng(latSimulada, lngSimulada);
      if (this.deliveryMarker) this.deliveryMarker.setLatLng(nuevaPos);
      this.map.setView(nuevaPos, this.map.getZoom(), { animate: true });
    }
    this.cdr.detectChanges();
  }

  private activarRastreoGps(): void {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.latitud = position.coords.latitude;
          this.longitud = position.coords.longitude;
          this.errorGps = '';

          if (this.pedidoId && this.pedidoId !== 'null' && this.pedidoId !== 'BR-LOCAL-TEST') {
            this.firebaseService.actualizarUbicacionPedido(this.pedidoId, this.latitud, this.longitud)
              .then(() => console.log('Ubicación del repartidor sincronizada en Firestore.'))
              .catch((err) => console.error('Error al guardar datos en Firebase:', err));
          }

          this.cdr.detectChanges();
        },
        (error) => {
          this.errorGps = error.message;
          this.cdr.detectChanges();
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    }
  }
}
