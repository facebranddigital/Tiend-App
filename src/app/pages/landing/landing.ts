import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para @if y @for
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss'],
})
export class LandingComponent {
  // 1. Control de Modales y Carrito usando Signals
  showModal = signal(false);
  showRegisterModal = signal(false);
  cart = signal<any[]>([]); // Aquí es donde viven tus productos

  // 2. Formulario de Registro
  registerForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
  });

  // 3. Funciones de Modales
  toggleModal() {
    this.showModal.update((valor) => !valor);
  }

  toggleRegisterModal() {
    this.showRegisterModal.update((v) => !v);
  }

  // 4. Lógica del Carrito (LIMPIA)
  onAddToCart(name: string, price: number, category: string, image: string) {
  const newProduct = { name, price, category, image };

   //  Guardar en la lista
  this.cart.update(prevCart => [...prevCart, newProduct]);

    console.log('Agregado:', newProduct);
    console.log('Total productos en carro:', this.cart().length);
     alert(`¡Añadido al carrito: ${name}!`);
  
  }

  // Lógica de Registro
  onSubmit() {
    if (this.registerForm.valid) {
      console.log('Datos de registro:', this.registerForm.value);
      alert('¡Registro exitoso! Bienvenido a TIEND.');

      this.toggleRegisterModal();
      this.registerForm.reset(); 
    } else {
  // Marcar campos como tocados para mostrar errores visuales si el usuario intenta enviar vacío
      this.registerForm.markAllAsTouched();
    }
  }
}