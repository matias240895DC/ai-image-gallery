import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public user: any;
  public status: string | null = null;
  public message: string = '';
  public showPassword: boolean = false;

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _cdr: ChangeDetectorRef
  ) {
    this.user = {
      email: '',
      password: ''
    };
  }

  onSubmit() {
    this._authService.login(this.user).subscribe({
      next: (response) => {
        if (response.token && response.refreshToken) {
          this.status = 'success';
          this._authService.setSession(response.token, response.refreshToken, response.user);
          this._cdr.detectChanges();
          this._router.navigate(['/gallery']);
        }
      },
      error: (error) => {
        this.status = 'error';
        this.message = error.error.message || 'Error al iniciar sesión';
        this._cdr.detectChanges();
      }
    });
  }
}
