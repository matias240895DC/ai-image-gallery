import { Directive, HostListener, Input } from '@angular/core';
import { NavigationLockService } from '../services/navigation-lock.service';

@Directive({
  selector: '[appNavAllowed]',
  standalone: true,
})
export class AppNavAllowedDirective {
  @Input('appNavAllowed') public target?: string | Array<string | number>;

  constructor(private _navigationLock: NavigationLockService) {}

  @HostListener('click', ['$event'])
  onClick(_event: MouseEvent) {
    const url = this.normalize(this.target);
    if (!url) return;
    this._navigationLock.allow(url);
  }

  private normalize(value: string | Array<string | number> | undefined): string | null {
    if (!value) return null;

    if (Array.isArray(value)) {
      const parts = value
        .map((p) => String(p))
        .filter(Boolean)
        .join('/');
      const collapsed = parts.replace(/\/+/g, '/');
      return collapsed.startsWith('/') ? collapsed : `/${collapsed}`;
    }

    let s = String(value).trim();
    if (!s) return null;
    s = s.replace(/\/+/g, '/');
    return s.startsWith('/') ? s : `/${s}`;
  }
}

