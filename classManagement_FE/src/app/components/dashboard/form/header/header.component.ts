import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from './services/theme.service';
import { ITheme } from '../../../../core/interfaces/theme.interface';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, CommonModule, MatTabsModule, MatMenuModule, MatButtonModule, RouterModule],
  providers: [ThemeService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  public themes: ITheme[] = [];
  public currentTheme!: ITheme;
  public showSidebarRight: boolean = false;
  public check: boolean = false;

  @Output() toggleSidebar: EventEmitter<void> = new EventEmitter<void>();

  handleToggleSidebar() {
    this.toggleSidebar.emit();
  }

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themes = this.themeService.getThemes();
    this.currentTheme = this.themeService.getTheme();
  }

  setTheme(theme: ITheme) {
    this.themeService.setTheme(theme);
    this.currentTheme = theme;
  }

  handleShowSidebarRight() {
    this.showSidebarRight = true;
    const sidebar = document.querySelector('.side-bar-right') as HTMLElement;
    const overlay = document.querySelector('.overlay') as HTMLElement;

    if (sidebar && overlay) {
      sidebar.style.display = 'block';
      overlay.style.display = 'block';
      sidebar.classList.remove('hide');
      overlay.classList.remove('hide');
    }
    this.check = true;
  }

  handleHideSidebarRight() {
    const sidebar = document.querySelector('.side-bar-right') as HTMLElement;
    const overlay = document.querySelector('.overlay') as HTMLElement;
    if (sidebar && overlay) {
      sidebar.classList.add('hide');
      overlay.classList.add('hide');

      setTimeout(() => {
        sidebar.style.display = 'none';
        overlay.style.display = 'none';
      }, 400);
    }
    this.check = false;
  }
}
