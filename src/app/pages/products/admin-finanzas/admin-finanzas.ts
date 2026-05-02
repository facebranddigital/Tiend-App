import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// 1. Interfaces (Necesarias para corregir TS2304)
interface Insumo {
  nombre: string;
  costo: number;
}
interface Produccion {
  nombre: string;
  unidades: number;
}
interface Message {
  role: 'user' | 'model';
  text: string;
}

@Component({
  selector: 'app-admin-finanzas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-finanzas.html',
  styleUrl: './admin-finanzas.scss',
})
export class AdminFinanzasComponent {
  // --- ESTADO EDITABLE ---
  insumos = signal<Insumo[]>([{ nombre: 'Insumo', costo: 0 }]);
  produccion = signal<Produccion[]>([{ nombre: 'Producto final', unidades: 0 }]);
  gastoServicios = signal<number>(0);
  ventasTotalesDia = signal<number>(0);

  // --- ESTADO DEL CHAT ---
  isOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  userInput: string = '';
  messages = signal<Message[]>([]);

  // --- CÁLCULOS DINÁMICOS (Tipado para corregir TS7006) ---
  totalInsumos = computed(() =>
    this.insumos().reduce((acc: number, i: Insumo) => acc + (i.costo || 0), 0),
  );

  totalUnidades = computed(() =>
    this.produccion().reduce((acc: number, p: Produccion) => acc + (p.unidades || 0), 0),
  );

  costoTotalReal = computed(() => this.totalInsumos() + this.gastoServicios());

  costoPorUnidad = computed(() =>
    this.totalUnidades() > 0 ? this.costoTotalReal() / this.totalUnidades() : 0,
  );

  gananciaNetaDia = computed(() => this.ventasTotalesDia() - this.costoTotalReal());

  // --- ACCIONES DE FINANZAS ---
  agregarInsumo() {
    this.insumos.update((v: Insumo[]) => [...v, { nombre: '', costo: 0 }]);
  }
  eliminarInsumo(index: number) {
    this.insumos.update((v: Insumo[]) => v.filter((_, i: number) => i !== index));
  }

  agregarProducto() {
    this.produccion.update((v: Produccion[]) => [...v, { nombre: '', unidades: 0 }]);
  }
  eliminarProducto(index: number) {
    this.produccion.update((v: Produccion[]) => v.filter((_, i: number) => i !== index));
  }

  // --- ACCIONES DEL CHAT ---
  toggleChat() {
    this.isOpen.update((v: boolean) => !v);
  }

  sendMessage() {
    const text = this.userInput.trim().toLowerCase();
    if (!text) return;

    // 1. Añadir el mensaje del usuario
    this.messages.update((prev: Message[]) => [...prev, { role: 'user', text: this.userInput }]);

    this.userInput = '';
    this.isLoading.set(true);

    // 2. Simular retraso
    setTimeout(() => {
      let botResponse = '';

      // 3. Lógica de respuestas
      if (text.includes('hola') || text.includes('buenos días')) {
        botResponse =
          '¡Hola! Bienvenido a Bracasfood 🍦. ¿En qué puedo ayudarte con tus finanzas hoy?';
      } else if (text.includes('ganancia') || text.includes('utilidad')) {
        botResponse =
          'Para ver tu ganancia, asegura de llenar todos los campos de Insumos y Ventas Totales arriba 👆.';
      } else if (text.includes('bolis') || text.includes('helado')) {
        botResponse =
          '¡Nuestros bolis son los mejores! Recuerda calcular bien el costo del azúcar y la leche en la tabla de insumos.';
      } else if (text.includes('gracias')) {
        botResponse = '¡Con gusto! Aquí estaré si necesitas más ayuda con tus cuentas. 📈';
      } else {
        botResponse =
          'Entiendo. Recuerda que puedes registrar tus materias primas a la izquierda para tener el balance exacto.';
      }

      // 4. Respuesta del bot
      this.messages.update((prev: Message[]) => [...prev, { role: 'model', text: botResponse }]);

      this.isLoading.set(false);
    }, 1000);
  }
} // <--- Asegúrate de que este sea el cierre final de la clase
