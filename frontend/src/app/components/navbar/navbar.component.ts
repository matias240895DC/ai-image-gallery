import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { BrandingService } from '../../services/branding.service';
import { AppNavAllowedDirective } from '../../directives/app-nav-allowed.directive';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, AppNavAllowedDirective],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  public token: string | null = null;
  public user: any = null;
  public projectName = 'Proyecto';
  public projectSuffix = '1';
  public logoDataUrl = '';
  public logoLoadFailed = false;
  private _authSubscription: Subscription | null = null;
  private _brandingSubscription: Subscription | null = null;

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _brandingService: BrandingService
  ) {}

  ngOnInit(): void {
    this._authSubscription = this._authService.authStatus$.subscribe({
      next: (status) => {
        this.token = status.token;
        this.user = status.user;
      }
    });

    this._brandingSubscription = this._brandingService.settings$.subscribe({
      next: (settings) => {
        this.projectName = settings.projectName;
        this.projectSuffix = settings.projectSuffix;
        this.logoDataUrl = settings.logoDataUrl;
        this.logoLoadFailed = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this._authSubscription) {
      this._authSubscription.unsubscribe();
    }
    if (this._brandingSubscription) {
      this._brandingSubscription.unsubscribe();
    }
  }


  logout() {
    this._authService.clearSession();
    this._router.navigate(['/login']);
  }
}
