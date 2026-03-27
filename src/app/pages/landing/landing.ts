import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class LandingComponent {
  showModal = signal(false);
  showRegisterModal = signal(false);

  registerForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9+ ]*$')])
  });

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
      console.log('Form Submitted', this.registerForm.value);
      this.toggleRegisterModal();
      alert('¡Registro exitoso! Bienvenido a TIEND.');
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
