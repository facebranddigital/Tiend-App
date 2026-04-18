import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// 1. Importas el archivo que acabamos de crear
import { ChatAiComponent } from './components/chat-ai/chat-ai.component';

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. Lo agregas a la lista de imports aquí abajo
  imports: [RouterOutlet, ChatAiComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  title = 'tiend-app';
}
