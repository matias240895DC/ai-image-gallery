import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  public activeTab: 'logs' | 'users' = 'logs';
  public logs: any[] = [];
  public users: any[] = [];
  public isLoadingLogs = false;
  public isLoadingUsers = false;
  public errorMsg = '';

  constructor(private _authService: AuthService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  setTab(tab: 'logs' | 'users') {
    this.activeTab = tab;
    if (tab === 'logs' && this.logs.length === 0) this.loadLogs();
    if (tab === 'users' && this.users.length === 0) this.loadUsers();
  }

  loadLogs() {
    this.isLoadingLogs = true;
    this.errorMsg = '';
    this._authService.getSecurityLogs().subscribe({
      next: (res: any) => {
        this.logs = res.logs || [];
        this.isLoadingLogs = false;
      },
      error: () => {
        this.errorMsg = 'Error al cargar los logs';
        this.isLoadingLogs = false;
      }
    });
  }

  loadUsers() {
    this.isLoadingUsers = true;
    this.errorMsg = '';
    this._authService.getUsers().subscribe({
      next: (res: any) => {
        this.users = res.users || [];
        this.isLoadingUsers = false;
      },
      error: () => {
        this.errorMsg = 'Error al cargar los usuarios';
        this.isLoadingUsers = false;
      }
    });
  }

  toggleRole(u: any) {
    const newRole = u.role === 'superadmin' ? 'user' : 'superadmin';
    this._authService.updateUserRole(u._id, newRole).subscribe({
      next: (res: any) => {
        u.role = res.user.role;
      },
      error: () => {
        this.errorMsg = 'Error al cambiar el rol';
      }
    });
  }

  getStatusClass(status: string): string {
    return status === 'allowed' ? 'status-allowed' : 'status-denied';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-AR');
  }

  truncate(text: string, max = 80): string {
    return text && text.length > max ? text.substring(0, max) + '…' : text;
  }
}
