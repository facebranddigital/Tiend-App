import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-sabores-narino',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sabores-narino.html',
  styleUrl: './sabores-narino.scss',
})
export class SaboresNarinoComponent {
  private cartService = inject(CartService);

  /**
   * Recibe los 5 argumentos desde el HTML y agrega al carrito
   */
  onAddToCart(name: string, price: number, category: string, image: string, quantity: number) {
    // Castamos el objeto a 'any' para que no se queje de la propiedad 'image'
    this.cartService.addToCart({
      name,
      price,
      category,
      image,
      quantity,
    } as any);

    this.lanzarConfeti();
  }

  private lanzarConfeti() {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b00', '#ffb800', '#ffffff'],
      zIndex: 1000,
    });
  }
}
