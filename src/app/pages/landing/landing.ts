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

scrollTo(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    console.warn(`Ojo: No encontré la sección con el ID: ${sectionId}`);
  }
}
  updateQty(amount: number) {
    this.qty2.update((v) => {
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

  // Asegúrate de que tu función reciba el valor del input del HTML
  onAddToCart(name: string, price: any, category: string, image: string, quantity: any) {
    const qty = parseInt(quantity) || 1; // Si por algo llega nulo, ponemos 1
    const pPrice = parseInt(price);

    const newProduct: any = {
      name,
      price: pPrice,
      category,
      imageUrl: image, // Cambia 'image' por 'imageUrl'
      quantity: qty,
    };

    this.cartService.addToCart(newProduct);

    Swal.fire({
      title: '¡Excelente elección!',
      text: `Agregaste ${qty} unidad(es) de ${name}`,
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
