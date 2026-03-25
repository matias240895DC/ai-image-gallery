import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BrandingService } from './services/branding.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main>
      <router-outlet />
    </main>
  `,
  styles: [`
    main {
      padding-top: 1rem;
      padding-bottom: 4rem;
    }
  `],
})
export class App {
  constructor(
    private _brandingService: BrandingService,
    private _router: Router
  ) {
    this._brandingService.init();

    // Asegura que el arranque siempre aterrice en /gallery.
    // (Aunque ya hay redirect en rutas, esto lo hace robusto ante rutas previas del navegador)
    const pathname = window.location.pathname || '/';
    if (pathname === '/' || pathname === '') {
      // replaceUrl evita que el botón "Atrás" vuelva a "/"
      this._router.navigateByUrl('/gallery', { replaceUrl: true });
    }
  }
}
