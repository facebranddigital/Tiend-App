import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="whatsapp-float" (click)="openWhatsApp()" title="Chatea con Bracasfood">
      <b style="color:white; font-size:25px;">WA</b>
    </div>
  `,
  styles: [
    `
      .whatsapp-float {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #25d366;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.4);
        z-index: 1000;
        transition: all 0.3s ease;
      }

      .whatsapp-float:hover {
        transform: scale(1.1);
        background-color: #20ba5a;
      }

      img {
        width: 35px;
        height: 35px;
      }

      /* Ajuste para móviles */
      @media (max-width: 768px) {
        .whatsapp-float {
          bottom: 15px;
          right: 15px;
          width: 55px;
          height: 55px;
        }
      }
    `,
  ],
})
export class ChatAiComponent {
  openWhatsApp() {
    const phone = '573218119383';
    const message = encodeURIComponent(
      '¡Hola Bracasfood! Vi la tienda y me gustaría hacer un pedido.',
    );
    const url = `https://wa.me/${phone}?text=${message}`;

    window.open(url, '_blank');
  }
}
