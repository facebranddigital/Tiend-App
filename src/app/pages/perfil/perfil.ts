import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss'],
})
export class PerfilComponent implements OnInit {
  public nombre: string = '';
  public telefono: string = '';
  public direccion: string = '';
  public fotoUrl: string = 'assets/driver-avatar.png';
  public ultimoPedidoId: string = '';

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
    this.firebaseService.usuarioActivo$.subscribe({
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
      },
    });
  }

  private cargarDatosPerfil(uid: string): void {
    this.firebaseService.obtenerPerfilUsuario(uid).subscribe({
      next: (perfil) => {
        if (perfil) {
          this.nombre = perfil.nombre || '';
          this.telefono = perfil.telefono || '';
          this.direccion = perfil.direccion || '';
          this.fotoUrl = perfil.fotoUrl || 'assets/driver-avatar.png';
          this.ultimoPedidoId = perfil.ultimoPedidoId || '';
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los datos del servidor.';
        this.cargando = false;
      },
    });
  }

  async cambiarFoto(event: any) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    this.subiendoImagen = true;
    this.error = '';

    try {
      const urlDescarga = await this.firebaseService.subirFotoPerfil(this.userUid, archivo);
      this.fotoUrl = urlDescarga;

      await this.firebaseService.guardarPerfilUsuario(this.userUid, { fotoUrl: urlDescarga });

      this.mensajeExito = '¡Foto de perfil actualizada!';
      setTimeout(() => (this.mensajeExito = ''), 3000);
    } catch (err) {
      console.error(err);
      this.error = 'Error al subir la imagen. Intenta de nuevo.';
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

    const datosPerfil = {
      nombre: this.nombre,
      telefono: this.telefono,
      direccion: this.direccion,
    };

    try {
      await this.firebaseService.guardarPerfilUsuario(this.userUid, datosPerfil);
      this.mensajeExito = '¡Perfil guardado con éxito!';
      setTimeout(() => (this.mensajeExito = ''), 3000);
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
