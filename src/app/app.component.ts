import { Component, OnInit } from '@angular/core'; // Añadimos OnInit
import { RouterOutlet } from '@angular/router';
import { ChatAiComponent } from './components/chat-ai/chat-ai.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatAiComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.scss',
})
export class AppComponent implements OnInit {
  // Implementamos la interfaz
  title = 'Bracasfood';

  ngOnInit() {
    // Esto mantiene la pantalla de carga activa por 1.5 segundos extras
    setTimeout(() => {
      console.log('App lista y cargada');
    }, 1500);
  }
} // <--- La llave de cierre de la clase debe ir al final de TODO
