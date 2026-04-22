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
  qty2 = signal(1); // Esta es la señal para el contador de unidades
  // Función para subir o bajar la cantidad
  updateQty(amount: number) {
    this.qty2.update(v => {
      const newValue = v + amount;
      return newValue < 1 ? 1 : newValue; // Evita que baje de 1
    });
  }

  // Tu función onAddToCart ya está perfecta, solo asegúrate de pasarle this.qty2()

  constructor(public cartService: CartService) {}

  registerForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
  });

  // --- FUNCIONES DE CONTROL DE MODALES ---

  toggleModal() {
    this.showModal.update((v) => !v);
  }

  // ESTA ES LA QUE TE FALTABA PARA QUE EL NG SERVE NO DE ERROR
  toggleRegisterModal() {
    this.showRegisterModal.update((v) => !v);
  }

  // --- LÓGICA DE NEGOCIO ---

  irAWhatsApp() {
    const telefono = '573116213800';
    const mensaje = encodeURIComponent(
      '¡Hola Bracasfood! Quiero hacer un pedido y conocer más sobre sus productos.',
    );
    const url = `https://wa.me/${telefono}?text=${mensaje}`;
    window.open(url, '_blank');
  }

  // Actualiza la función para que reciba "quantity"
onAddToCart(name: string, price: any, category: string, image: string, quantity: any = 1) {
  // Convertimos la cantidad a número por si acaso
  const qty = parseInt(quantity);
  const pPrice = parseInt(price); // Aseguramos que el precio sea número
 
  const newProduct = { name, price: pPrice, category, image, quantity: qty };
  this.cartService.addToCart(newProduct);

  Swal.fire({
    title: '¡Excelente elección!',
    text: `${name} x${qty} unidades`, // Ahora el mensaje dice cuántos llevas
    icon: 'success',
    confirmButtonColor: '#ff6b00',
    timer: 1500,
    showConfirmButton: false,
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
