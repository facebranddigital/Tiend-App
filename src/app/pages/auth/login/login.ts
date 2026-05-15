import { Component, inject, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FacialAuthService } from '../../../services/facial_auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent implements OnDestroy {
  private videoEl?: ElementRef<HTMLVideoElement>;
  private canvasEl?: ElementRef<HTMLCanvasElement>;

  @ViewChild('video') set video(content: ElementRef<HTMLVideoElement> | undefined) {
    if (content) {
      this.videoEl = content;
      // Eliminamos el llamado directo automático aquí para evitar colisiones
    }
  }

  @ViewChild('canvas') set canvas(content: ElementRef<HTMLCanvasElement> | undefined) {
    if (content) {
      this.canvasEl = content;
    }
  }

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private facialAuthService = inject(FacialAuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); // INYECTADO: Control de renderizado del DOM

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  showPassword = false;
  loading = false;
  errorMessage = '';
  stepFacial = false;
  mediaStream: MediaStream | null = null;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;

    this.authService
      .login(email, password)
      .then(() => {
        this.loading = false;
        this.stepFacial = true;

        // SOLUCIÓN: Sincroniza el DOM y arranca la cámara de forma segura
        this.cdr.detectChanges();
        this.vincularFlujoCamara();
      })
      .catch((err) => {
        console.error(err);
        this.errorMessage = 'Credenciales inválidas.';
        this.loading = false;
      });
  }

  async vincularFlujoCamara() {
    if (this.mediaStream) return;
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 300 },
      });
      if (this.videoEl) {
        this.videoEl.nativeElement.srcObject = this.mediaStream;
      }
    } catch (err) {
      this.errorMessage = 'No se pudo activar la cámara web.';
    }
  }

  verificarRostro() {
    if (!this.videoEl || !this.canvasEl) {
      this.errorMessage = 'Los elementos de la cámara no están listos.';
      return;
    }

    const video = this.videoEl.nativeElement;
    const canvas = this.canvasEl.nativeElement;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      this.errorMessage = 'Inicializando cámara. Reintente.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const context = canvas.getContext('2d');

    if (!context) {
      this.errorMessage = 'Error interno del lienzo gráfico.';
      this.loading = false;
      return;
    }

    const userId = this.authService.obtenerUsuarioActualUid();
    if (!userId) {
      this.errorMessage = 'Fallo de sesión. Reingresa tus datos.';
      this.loading = false;
      this.stepFacial = false;
      this.apagarCamara();
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          this.errorMessage = 'Error capturando fotograma.';
          this.loading = false;
          return;
        }

        this.facialAuthService.verificarRostro(userId, blob).subscribe({
          next: () => {
            this.apagarCamara();
            this.loading = false;
            this.router.navigate(['/products']);
          },
          error: (error) => {
            this.errorMessage = `Error de coincidencia: ${error.error?.detail || 'El rostro no coincide.'}`;
            this.loading = false;
          },
        });
      },
      'image/jpeg',
      0.95,
    );
  }

  apagarCamara() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  ngOnDestroy() {
    this.apagarCamara();
  }
}
