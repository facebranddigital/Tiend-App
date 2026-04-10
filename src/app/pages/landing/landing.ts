import { Component, signal, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService, Product } from '../../services/cart.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class LandingComponent {
  public cartService = inject(CartService);
  showModal = signal(false);
  showRegisterModal = signal(false);

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
      console.log('Form Submitted', this.registerForm.value);
      this.toggleRegisterModal();
      alert('¡Registro exitoso! Bienvenido a TIEND.');
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
