import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  private router = inject(Router);

  onLogout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
