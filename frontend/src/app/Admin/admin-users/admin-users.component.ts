import { Component, OnInit } from '@angular/core';
import { User } from '../../Model/User.model';
import { StatsService } from '../../Services/stats-admin/stats.service';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [AdminSidebarComponent, CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  searchtext: string = '';
  isProcessing: Record<number, boolean> = {};

  constructor(private stats_service: StatsService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.stats_service.getAllusers().subscribe({
      next: (res) => {
        this.users = res;
      },
      error: () => {
        console.log('error');
      }
    });
  }

  search() {
    this.stats_service.getAllsearchusers(this.searchtext).subscribe({
      next: (res) => {
        this.users = res;
      },
      error: () => {
        console.log('ERROR LIST');
      }
    });
  }

  isUserProcessing(id: number): boolean {
    return this.isProcessing[id] ?? false;
  }


  getInitial(username: string): string {
    return (username || '?').charAt(0).toUpperCase();
  }

  disable(id: number) {
    const user = this.users.find((u) => u.id === id);
    if (!user || this.isUserProcessing(id)) {
      return;
    }

    const warningMessage = user.enabled === false
      ? `Are you sure you want to enable ${user.username}'s account?`
      : `Are you sure you want to disable ${user.username}'s account?`;
    if (!window.confirm(warningMessage)) {
      return;
    }

    this.isProcessing[id] = true;

    this.stats_service.disableaccount(id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => {
        console.log(err);
        this.isProcessing[id] = false;
      },
      complete: () => {
        this.isProcessing[id] = false;
      }
    });
  }

  toggleHrRole(id: number): void {
    const user = this.users.find((u) => u.id === id);
    if (!user || this.isUserProcessing(id) || user.role === 'ADMIN') {
      return;
    }

    const warningMessage = user.role === 'RH'
      ? `Are you sure you want to set ${user.username} as USER?`
      : `Are you sure you want to set ${user.username} as RH?`;

    if (!window.confirm(warningMessage)) {
      return;
    }

    this.isProcessing[id] = true;
    this.stats_service.toggleUserHrStatus(id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => {
        console.log(err);
        this.isProcessing[id] = false;
      },
      complete: () => {
        this.isProcessing[id] = false;
      }
    });
  }
}
