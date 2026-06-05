import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss'],
})
export class PerfilComponent implements OnInit, OnDestroy {
  // Datos del perfil adaptados a tu base de datos
  public nombre: string = '';
  public telefono: string = '';
  public direccion: string = '';
  public fotoUrl: string = 'assets/driver-avatar.png'; // Fallback por defecto
  public ultimoPedidoId: string = '';

  // Estado del pedido en tiempo real para el perfil
  public pedidoEstadoActual: number = 0;
  public pedidoTiempoEstimado: number = 35;
  private pedidoSub!: Subscription;
  private usuarioSub!: Subscription;

  // Estados de control de la UI
  public cargando: boolean = true;
  public guardando: boolean = false;
  public subiendoImagen: boolean = false;
  public mensajeExito: string = '';
  public error: string = '';
  private userUid: string = '';

  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.usuarioSub = this.firebaseService.usuarioActivo$.subscribe({
      next: (user) => {
        if (user) {
          this.userUid = user.uid;
          this.cargarDatosPerfil(user.uid);
        } else {
          this.cargando = false;
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.error = 'Error de autenticación.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  ngOnDestroy(): void {
    if (this.pedidoSub) this.pedidoSub.unsubscribe();
    if (this.usuarioSub) this.usuarioSub.unsubscribe();
  }

  private cargarDatosPerfil(uid: string): void {
    this.firebaseService.obtenerPerfilUsuario(uid).subscribe({
      next: (perfil) => {
        if (perfil) {
          this.nombre = perfil.nombre || '';
          this.telefono = perfil.telefono || '';
          this.direccion = perfil.direccion || '';
          
          // ✅ SOLUCIÓN AL NOMBRE DEL CAMPO: Lee 'URLFOTO' en mayúsculas desde tu Firestore
          this.fotoUrl = perfil.URLFOTO || 'assets/driver-avatar.png';

          if (perfil.ultimoPedidoId && perfil.ultimoPedidoId !== this.ultimoPedidoId) {
            this.ultimoPedidoId = perfil.ultimoPedidoId;
            this.conectarRastreadorPedidoInterno(this.ultimoPedidoId);
          }
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los datos del servidor.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  private conectarRastreadorPedidoInterno(orderId: string): void {
    if (this.pedidoSub) this.pedidoSub.unsubscribe();

    this.pedidoSub = this.firebaseService.escucharPedido(orderId).subscribe({
      next: (pedidoData: any) => {
        if (!pedidoData) return;

        const mapeoEstados: { [key: string]: number } = {
          received: 1,
          preparing: 2,
          on_the_way: 3,
          delivered: 4,
        };

        this.pedidoEstadoActual = mapeoEstados[pedidoData.status] || 1;
        if (pedidoData.estimatedTime) {
          this.pedidoTiempoEstimado = pedidoData.estimatedTime;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('No hay pedidos activos vinculados para mostrar.');
        this.pedidoEstadoActual = 0;
        this.cdr.detectChanges();
      },
    });
  }

  public obtenerPorcentajeProgresoPerfil(): number {
    switch (this.pedidoEstadoActual) {
      case 1: return 0;
      case 2: return 33;
      case 3: return 66;
      case 4: return 100;
      default: return 0;
    }
  }

  async cambiarFoto(event: any) {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    this.subiendoImagen = true;
    this.error = '';
    this.cdr.detectChanges();

    try {
      const urlDescarga = await this.firebaseService.subirFotoPerfil(this.userUid, archivo);
      this.fotoUrl = urlDescarga;
      
      // ✅ SOLUCIÓN: Guarda usando la clave 'URLFOTO' en mayúsculas para no duplicar campos
      await this.firebaseService.guardarPerfilUsuario(this.userUid, { URLFOTO: urlDescarga });
      
      this.mensajeExito = '¡Foto de perfil actualizada!';
      setTimeout(() => {
        this.mensajeExito = '';
        this.cdr.detectChanges();
      }, 3000);
    } catch (err) {
      this.error = 'Error al subir la imagen.';
    } finally {
      this.subiendoImagen = false;
      this.cdr.detectChanges();
    }
  }

  async guardarCambios() {
    if (!this.nombre.trim()) {
      this.error = 'El nombre es obligatorio.';
      return;
    }

    this.guardando = true;
    this.error = '';
    this.cdr.detectChanges();

    const datosPerfil = {
      nombre: this.nombre,
      telefono: this.telefono,
      direccion: this.direccion,
    };

    try {
      await this.firebaseService.guardarPerfilUsuario(this.userUid, datosPerfil);
      this.mensajeExito = '¡Perfil guardado con éxito!';
      setTimeout(() => {
        this.mensajeExito = '';
        this.cdr.detectChanges();
      }, 3000);
    } catch (err) {
      this.error = 'No se pudieron guardar los cambios.';
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  verPedidoActivo() {
    if (this.ultimoPedidoId) {
      this.router.navigate(['/seguimiento', this.ultimoPedidoId]);
    }
  }
}
