import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router'; 
import { CommonModule } from '@angular/common'; // Para usar *ngIf y [ngClass]
import { AuthService } from '../../services/auth.service'; // Tu servicio de usuarios

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent {
  private authService = inject(AuthService); 

  // 🧡 CONECTADO CON LA VARIABLE REAL: Usamos isAdmin$ que sí existe en tu AuthService
  isEverAdminActive$ = this.authService.isAdmin$; 
}
