import { Component, signal, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService, Product } from '../../services/cart.service';
import { EmailService } from '../../services/email.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class LandingComponent {
  public cartService = inject(CartService);
  private emailService = inject(EmailService);
  
  showModal = signal(false);
  showRegisterModal = signal(false);
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);

  registerForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9+ ]*$')])
  });

  onAddToCart(name: string, price: number, category: string, imageUrl: string) {
    const product: Product = {
      name,
      price,
      category,
      imageUrl,
      description: 'Producto destacado de la colección TIEND.',
      stock: 10
    };
    this.cartService.addToCart(product);
  }

  toggleModal() {
    this.showModal.update(v => !v);
  }

  toggleRegisterModal() {
    if (!this.showRegisterModal()) {
      this.registerForm.reset();
    }
    this.showRegisterModal.update(v => !v);
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isSubmitting.set(true);
      this.submitError.set(null);

      const formData = {
        firstName: this.registerForm.get('firstName')?.value || '',
        lastName: this.registerForm.get('lastName')?.value || '',
        email: this.registerForm.get('email')?.value || '',
        phone: this.registerForm.get('phone')?.value || ''
      };

      this.emailService.sendWelcomeEmail(formData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response.success) {
            this.toggleRegisterModal();
            alert('¡Registro exitoso! Te hemos enviado un correo de bienvenida.');
          }
        },
        error: (error) => {
          this.isSubmitting.set(false);
          console.error('Error sending email:', error);
          this.submitError.set('Hubo un error al procesar tu registro. Por favor, intenta de nuevo.');
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
