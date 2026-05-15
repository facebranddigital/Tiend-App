import { Component, inject, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FacialAuthService } from '../../../services/facial_auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent implements OnDestroy {
  // CORREGIDO: Tipado opcional con ? para evitar el error de asignación del compilador estricto
  private videoEl?: ElementRef<HTMLVideoElement>;
  private canvasEl?: ElementRef<HTMLCanvasElement>;

  @ViewChild('video') set video(content: ElementRef<HTMLVideoElement> | undefined) {
    if (content) {
      this.videoEl = content;
      this.vincularFlujoCamara();
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

  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  errorMessage = '';
  stepFacial = false;
  mediaStream: MediaStream | null = null;
  nuevoUserId = '';

  registerForm: FormGroup = this.fb.group(
    {
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );

  passwordMatchValidator(g: AbstractControl) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
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

    this.authService
      .register(email, password)
      .then((res: any) => {
        this.nuevoUserId = res?.user?.uid || '';
        this.loading = false;
        this.stepFacial = true;
      })
      .catch((err: any) => {
        console.error(err);
        this.errorMessage =
          err.code === 'auth/email-already-in-use'
            ? 'Este correo ya está registrado.'
            : 'Error al registrar.';
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
      this.errorMessage = 'No se pudo acceder a la cámara web.';
    }
  }

  guardarRostroOriginal() {
    // CORREGIDO: Validación segura de existencia para complacer a TypeScript
    if (!this.videoEl || !this.canvasEl) {
      this.errorMessage = 'Los elementos de la cámara no están listos.';
      return;
    }

    const video = this.videoEl.nativeElement;
    const canvas = this.canvasEl.nativeElement;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      this.errorMessage = 'Inicializando cámara. Intenta de nuevo.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const context = canvas.getContext('2d');
    if (!context) {
      this.errorMessage = 'Error del contexto gráfico.';
      this.loading = false;
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          this.errorMessage = 'Error en la captura.';
          this.loading = false;
          return;
        }

        this.facialAuthService.registrarRostro(this.nuevoUserId, blob).subscribe({
          next: () => {
            this.apagarCamara();
            this.loading = false;
            this.router.navigate(['/products']);
          },
          error: (error) => {
            this.errorMessage = `Error biométrico: ${error.error?.detail || 'No se detectó el rostro.'}`;
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
