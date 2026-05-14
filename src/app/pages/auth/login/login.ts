import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { FooterComponent } from '../../../components/footer/footer';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  showPassword = false;
  loading = false;
  errorMessage = '';

  // Estados para el flujo biométrico
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

    // Paso 1: Autenticación tradicional contra Firebase
    this.authService
      .login(email, password)
      .then(() => {
        // Credenciales correctas. Iniciamos fase facial antes de redirigir.
        this.loading = false;
        this.stepFacial = true;
        this.activarCamara();
      })
      .catch((err) => {
        console.error(err);
        this.errorMessage = 'Credenciales inválidas. Por favor intenta de nuevo.';
        this.loading = false;
      });
  }

  async activarCamara() {
    try {
      // Esperamos el siguiente ciclo de renderizado para asegurar que el tag <video> exista
      setTimeout(async () => {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 400, height: 300 },
        });
        if (this.videoElement) {
          this.videoElement.nativeElement.srcObject = this.mediaStream;
        }
      }, 100);
    } catch (err) {
      this.errorMessage = 'No se pudo acceder a la cámara web para la verificación.';
      console.error(err);
    }
  }

  verificarRostro() {
    if (!this.videoElement || !this.canvasElement) return;

    this.loading = true;
    this.errorMessage = '';

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('file', blob, 'verificacion.jpg');

      // Extraemos el UID único asignado por Firebase de forma síncrona
      const userId = this.authService.obtenerUsuarioActualUid();

      if (!userId) {
        this.errorMessage = 'Error de sesión temporal. Por favor, reingresa tus datos.';
        this.loading = false;
        this.stepFacial = false;
        return;
      }

      // Consumo de tu endpoint real desplegado en Google Cloud Run mapeando el parámetro user_id
      fetch(`run.app{userId}`, {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((err) => {
              throw new Error(err.detail);
            });
          }
          return response.json();
        })
        .then(() => {
          this.apagarCamara();
          this.router.navigate(['/products']); // Acceso definitivo al dashboard de productos
        })
        .catch((error) => {
          this.errorMessage = `Fallo de validación facial: ${error.message}`;
          this.loading = false;
        });
    }, 'image/jpeg');
  }

  apagarCamara() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }
  }
}
