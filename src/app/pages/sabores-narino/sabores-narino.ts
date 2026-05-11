import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sabores-narino',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sabores-narino.html',
  styleUrl: './sabores-narino.scss',
})
export class SaboresNarinoComponent {
  platos = [
    {
      nombre: 'Cuy Asado Tradicional',
      descripcion: 'Acompañado de papas, crispetas y el auténtico ají de maní.',
      precio: 55000,
      imagen: 'assets/cuy1.jpg',
    },
    {
      nombre: 'Gallina Criolla',
      descripcion: 'Sabor de campo, cocción lenta y sazón única nariñense.',
      precio: 45000,
      imagen: 'assets/gallina.jpg',
    },
    {
      nombre: 'Frito Pastuso',
      descripcion: 'El clásico de nuestra tierra con mote y tostado.',
      precio: 18000,
      imagen: 'assets/frito.jpg',
    },
  ];

  pedirWhatsApp(plato: string) {
    const mensaje = encodeURIComponent(`¡Hola Bracasfood! 🚀 Quiero pedir: ${plato}`);
    window.open(`https://wa.me{mensaje}`, '_blank');
  }
}
