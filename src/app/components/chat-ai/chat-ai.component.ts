import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  template: `
    <div class="whatsapp-float" (click)="openWhatsApp()">
      <img src="assets/whatsapp-icon.png" alt="WhatsApp" />
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
        padding: 15px;
        cursor: pointer;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
        z-index: 1000;
      }
      img {
        width: 35px;
        height: 35px;
      }
    `,
  ],
})
export class ChatAiComponent {
  openWhatsApp() {
    const phone = '573218119383'; // Pon tu número de WhatsApp Business aquí (con el 57 de Colombia)
    const message = encodeURIComponent(
      '¡Hola Bracasfood! Vi la tienda y me gustaría hacer un pedido.',
    );
    const url = `https://wa.me/${phone}?text=${message}`;

    window.open(url, '_blank');
  }
}
