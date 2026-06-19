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
  private injectCdr = inject(ChangeDetectorRef);

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
        this.injectCdr.detectChanges();
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

          // Lee correctamente 'fotoUrl' desde tu base de datos de Firestore
          this.fotoUrl = perfil.fotoUrl || 'assets/driver-avatar.png';

          if (perfil.ultimoPedidoId && perfil.ultimoPedidoId !== this.ultimoPedidoId) {
            this.ultimoPedidoId = perfil.ultimoPedidoId;
            this.conectarRastreadorPedidoInterno(this.ultimoPedidoId);
          }
        }
        this.cargando = false;
        this.injectCdr.detectChanges();
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los datos del servidor.';
        this.cargando = false;
        this.injectCdr.detectChanges();
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
        this.injectCdr.detectChanges();
      },
      error: (err) => {
        console.warn('No hay pedidos activos vinculados para mostrar.');
        this.pedidoEstadoActual = 0;
        this.injectCdr.detectChanges();
      },
    });
  }

  public obtenerPorcentajeProgresoPerfil(): number {
    switch (this.pedidoEstadoActual) {
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

  /**
   * PROCESO DE SUBIDA DE IMAGEN TOTALMENTE CORREGIDO
   */
  async cambiarFoto(event: any) {
    // ✅ CORREGIDO: Captura correctamente el primer archivo del arreglo
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    this.subiendoImagen = true;
    this.error = '';
    this.injectCdr.detectChanges();

    try {
      // 1. Sube el archivo binario a Storage y extrae la URL pública
      const urlDescarga = await this.firebaseService.subirFotoPerfil(this.userUid, archivo);

      // 2. Guarda la URL bajo la clave exacta 'fotoUrl' para actualizar Firestore
      await this.firebaseService.guardarPerfilUsuario(this.userUid, { fotoUrl: urlDescarga });

      // 3. Renderiza de inmediato en la interfaz
      this.fotoUrl = urlDescarga;

      this.mensajeExito = '¡Foto de perfil actualizada!';
      this.injectCdr.detectChanges();

      setTimeout(() => {
        this.mensajeExito = '';
        this.injectCdr.detectChanges();
      }, 3000);
    } catch (err) {
      console.error('Error al procesar la imagen: ', err);
      this.error = 'Error al subir la imagen.';
    } finally {
      this.subiendoImagen = false;
      this.injectCdr.detectChanges();
    }
  }

  async guardarCambios() {
    if (!this.nombre.trim()) {
      this.error = 'El nombre es obligatorio.';
      return;
    }

    this.guardando = true;
    this.error = '';
    this.injectCdr.detectChanges();

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
        this.injectCdr.detectChanges();
      }, 3000);
    } catch (err) {
      this.error = 'No se pudieron guardar los cambios.';
    } finally {
      this.guardando = false;
      this.injectCdr.detectChanges();
    }
  }

  verPedidoActivo() {
    if (this.ultimoPedidoId) {
      this.router.navigate(['/seguimiento', this.ultimoPedidoId]);
    }
  }
}
