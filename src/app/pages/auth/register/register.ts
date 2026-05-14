import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { FooterComponent } from '../../../components/footer/footer';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = false;
  showConfirmPassword = false;

  registerForm: FormGroup = this.fb.group(
    {
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );

  loading = false;
  errorMessage = '';

  // Estados estructurales para el enrolamiento facial
  stepFacial = false;
  mediaStream: MediaStream | null = null;
  nuevoUserId = '';

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const { email, password } = this.registerForm.value;

    // Paso 1: Crear el registro de autenticación tradicional en Firebase
    this.authService
      .register(email, password)
      .then((res: any) => {
        // Almacenamos el UID generado por Firebase para indexar el vector en Firestore
        this.nuevoUserId = res?.user?.uid || '';
        this.loading = false;
        this.stepFacial = true;
        this.activarCamara();
      })
      .catch((err: any) => {
        console.error(err);
        if (err.code === 'auth/email-already-in-use') {
          this.errorMessage = 'Este correo ya está registrado.';
        } else {
          this.errorMessage = 'Error al registrar. Inténtalo de nuevo.';
        }
        this.loading = false;
      });
  }

  async activarCamara() {
    try {
      setTimeout(async () => {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 400, height: 300 },
        });
        if (this.videoElement) {
          this.videoElement.nativeElement.srcObject = this.mediaStream;
        }
      }, 100);
    } catch (err) {
      this.errorMessage = 'No se pudo acceder a la cámara para el enrolamiento biométrico.';
      console.error(err);
    }
  }

  guardarRostroOriginal() {
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
      formData.append('file', blob, 'registro.jpg');

      // Enviamos el rostro a la nube pasando el user_id correspondiente
      fetch(`run.app{this.nuevoUserId}`, {
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
          this.router.navigate(['/products']);
        })
        .catch((error) => {
          this.errorMessage = `Error al registrar tu plantilla biométrica: ${error.message}`;
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
