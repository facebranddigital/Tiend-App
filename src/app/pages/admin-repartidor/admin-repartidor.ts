import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';

@Component({
  selector: 'app-admin-repartidor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-repartidor.html',
  styleUrls: ['./admin-repartidor.scss'],
})
export class AdminRepartidorComponent implements OnInit, OnDestroy {
  public pedidoId: string = '';
  public estadoActual: string = 'received';
  public latitudActual: number = 3.4516;
  public longitudActual: number = -76.532;

  private map!: L.Map;
  private marker!: L.Marker;
  private pedidoSub!: Subscription;

  // ✅ Bandera de control para evitar el parpadeo mientras arrastras el mouse
  private estaArrastrando: boolean = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firebaseService = inject(FirebaseService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.pedidoId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.pedidoId) {
      this.router.navigate(['/']);
      return;
    }

    setTimeout(() => {
      this.inicializarMapaSimulador();
      this.escucharPedidoActual();
    }, 300);
  }

  ngOnDestroy(): void {
    if (this.pedidoSub) this.pedidoSub.unsubscribe();
  }

  private inicializarMapaSimulador(): void {
    const contenedor = document.getElementById('map-simulador');
    if (!contenedor || this.map) return;

    this.map = L.map('map-simulador', {
      trackResize: true,
    }).setView([this.latitudActual, this.longitudActual], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Simulador de Reparto Bracasfood',
    }).addTo(this.map);

    // Creamos el marcador arrastrable
    this.marker = L.marker([this.latitudActual, this.longitudActual], { draggable: true }).addTo(
      this.map,
    );

    // ✅ CONTROL DE EVENTOS: Cambiamos el estado de la bandera nativamente
    this.marker.on('dragstart', () => {
      this.estaArrastrando = true;
    });

    this.marker.on('dragend', () => {
      this.estaArrastrando = false;
      const posicion = this.marker.getLatLng();
      this.enviarCoordenadasAFirebase(posicion.lat, posicion.lng);
    });

    // Evento de clic directo en el mapa
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.marker.setLatLng(e.latlng);
      this.enviarCoordenadasAFirebase(e.latlng.lat, e.latlng.lng);
    });

    // ✅ SOLUCIÓN AL FONDO BEIGE: Redibuja las calles instantáneamente tras montar el layout
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 250);
  }

  private escucharPedidoActual(): void {
    this.pedidoSub = this.firebaseService.escucharPedido(this.pedidoId).subscribe((pedido) => {
      if (pedido) {
        this.estadoActual = pedido.status || 'received';
        if (pedido.repartidorLat && pedido.repartidorLng) {
          this.latitudActual = pedido.repartidorLat;
          this.longitudActual = pedido.repartidorLng;

          // ✅ SOLUCIÓN AL ERROR TS2339: Usamos nuestra bandera booleana limpia sin métodos raros
          if (this.marker && !this.estaArrastrando) {
            this.marker.setLatLng([this.latitudActual, this.longitudActual]);
          }
        }
        this.cdr.detectChanges();
      }
    });
  }

  private async enviarCoordenadasAFirebase(lat: number, lng: number) {
    this.latitudActual = lat;
    this.longitudActual = lng;
    try {
      await this.firebaseService.actualizarUbicacionPedido(this.pedidoId, lat, lng);
      console.log(`Ubicación actualizada en Firebase: Lat ${lat}, Lng ${lng}`);
    } catch (err) {
      console.error('Error al simular movimiento:', err);
    }
  }
}
