import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../services/cart';

declare var Swal: any; 

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

  constructor(public cartService: CartService) {}

  registerForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
  });

  // --- FUNCIONES DE CONTROL DE MODALES ---
  
  toggleModal() { 
    this.showModal.update(v => !v); 
  }

  // ESTA ES LA QUE TE FALTABA PARA QUE EL NG SERVE NO DE ERROR
  toggleRegisterModal() {
    this.showRegisterModal.update(v => !v);
  }

  // --- LÓGICA DE NEGOCIO ---

  irAWhatsApp() {
    const telefono = "573218119383";
    const mensaje = encodeURIComponent("¡Hola Bracasfood! Quiero hacer un pedido y conocer más sobre sus productos.");
    const url = `https://wa.me/${telefono}?text=${mensaje}`;
    window.open(url, '_blank');
  }

  onAddToCart(name: string, price: number, category: string, image: string) {
    const newProduct = { name, price, category, image };
    this.cartService.addToCart(newProduct);
    
    // Usamos el SweetAlert para confirmar
    Swal.fire({
      title: '¡Excelente elección!',
      text: `Añadido al carrito: ${name}`,
      icon: 'success',
      confirmButtonColor: '#ff6b00',
      timer: 2000,
      showConfirmButton: false
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      // Si el formulario es válido, podemos mandarlos a WhatsApp
      // y cerrar el modal automáticamente
      this.irAWhatsApp(); 
      this.toggleRegisterModal();
      this.registerForm.reset(); 
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}