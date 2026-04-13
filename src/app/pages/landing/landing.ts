import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../services/cart'; 

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss'],
})
export class LandingComponent {
  showModal = signal(false);
  showRegisterModal = signal(false);

  // Inyectamos el servicio global
  constructor(public cartService: CartService) {}

  registerForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
  });

  toggleModal() { this.showModal.update(v => !v); }
  toggleRegisterModal() { this.showRegisterModal.update(v => !v); }

  onAddToCart(name: string, price: number, category: string, image: string) {
    const newProduct = { name, price, category, image };
    
    // Guardamos en el servicio
    this.cartService.addToCart(newProduct);
    
    alert(`¡Añadido al carrito: ${name}!`);
  }

  onSubmit() {
    if (this.registerForm.valid) {
      alert('¡Registro exitoso!');
      this.toggleRegisterModal();
      this.registerForm.reset(); 
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}