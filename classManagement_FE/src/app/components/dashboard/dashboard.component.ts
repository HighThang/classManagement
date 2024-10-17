import { Component } from '@angular/core';
import { HeaderComponent } from './form/header/header.component';
import { SideBarLeftComponent } from './form/side-bar-left/side-bar-left.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SideBarLeftComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  sidebarVisible: boolean = true;

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;

    const sidebar = document.querySelector('app-side-bar-left') as HTMLElement;

    if (sidebar && this.sidebarVisible) {
      sidebar.style.display = 'block';
      sidebar.classList.remove('hide');
    }
    else {
      sidebar.classList.add('hide');
      setTimeout(() => {
        sidebar.style.display = 'none';
      }, 400);
    }
  }
}