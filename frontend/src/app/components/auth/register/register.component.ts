import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  public user: any;
  public status: string | null = null;
  public message: string = '';
  public loading: boolean = false;
  public showPassword: boolean = false;

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _cdr: ChangeDetectorRef
  ) {
    this.user = {
      name: '',
      surname: '',
      nick: '',
      email: '',
      password: ''
    };
  }

  onSubmit() {
    this.loading = true;
    console.log('[Register] Enviando datos:', this.user);
    this._authService.register(this.user).subscribe({
      next: (response) => {
        console.log('[Register] Respuesta exitosa:', response);
        this.loading = false;
        if (response) {
          this.status = 'success';
          this.message = 'Registro completado, ya puedes iniciar sesión.';
          this._cdr.detectChanges();
          setTimeout(() => this._router.navigate(['/login']), 2000);
        }
      },
      error: (error) => {
        console.error('[Register] Error:', error);
        this.status = 'error';
        this.loading = false;
        
        if (error.error.errors) {
          const firstErrorKey = Object.keys(error.error.errors)[0];
          this.message = error.error.errors[firstErrorKey];
        } else if (typeof error.error === 'object' && Object.keys(error.error).length > 0 && !error.error.message) {
          const firstErrorKey = Object.keys(error.error)[0];
          this.message = error.error[firstErrorKey];
        } else {
          this.message = error.error.message || 'Error al registrarse';
        }
        
        console.log('[Register] Estado final:', this.status, this.message);
        this._cdr.detectChanges();
      }
    });
  }
}
