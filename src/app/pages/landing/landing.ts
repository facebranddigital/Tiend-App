import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms'; // <-- IMPORTANTE: Añade esto para el buscador
declare var Swal: any;

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss'],
})
export class LandingComponent {
  showModal = signal(false);
  showRegisterModal = signal(false);
  qty2 = signal(1); // Esta es la señal para el contador de unidades
  // Función para subir o bajar la cantidad
   // 1. Añade la señal para el texto de búsqueda
  searchTerm = signal('');
  // 2. Define tus productos en una lista para que el buscador los encuentre
  products = [
    { id: 'platanos', name: 'Platanos BF', price: 2500, category: 'Snacks', image: 'assets/bracasfood2.webp' },
    { id: 'bolis-leche', name: 'Bolis de Leche', price: 2000, category: 'Pasabocas', image: 'assets/bracasfoodbolis.webp' },
    { id: 'bolis-natural', name: 'Bolis Naturales', price: 1500, category: 'Postres', image: 'assets/bolismorados.webp' },
    { id: 'papitas', name: 'Papitas BF', price: 2500, category: 'Snacks', image: 'assets/papasbf.webp' },
    { id: 'tocineta', name: 'Tocineta BF', price: 2500, category: 'Snacks', image: 'assets/tocinetabf.webp' },
  ];

  // 3. Esta función filtrará automáticamente mientras escribes
  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return [];
    return this.products.filter(p => p.name.toLowerCase().includes(term));
  });
  getTotalUnits(): number {
     return this.cartService.cartItems().reduce((acc, item) => acc + (item.quantity || 1), 0);
}
scrollTo(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    console.warn(`Ojo: No encontré la sección con el ID: ${sectionId}`);
  }
}
scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
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
