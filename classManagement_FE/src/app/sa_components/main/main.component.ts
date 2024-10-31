import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { HeaderComponent } from './form/header/header.component';
import { SideBarLeftComponent } from './form/side-bar-left/side-bar-left.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SideBarLeftComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements AfterViewInit {
  sidebarVisible: boolean = true;
  pos_isAbsolute: boolean = false; 

  @ViewChild('layoutWrapper') layoutWrapper!: ElementRef;

  constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    if (typeof document !== 'undefined') {
      this.toggleMenuVisibility();

      this.renderer.listen('window', 'resize', () => {
        this.toggleMenuVisibility();
      });
    }
    this.cdr.detectChanges();
  }
  
  toggleMenuVisibility() {
    const sidebarFooter = document.querySelector('.side-bar-footer') as HTMLElement;

    if (this.layoutWrapper.nativeElement.offsetHeight <= 300) {
      sidebarFooter.style.display = 'none';
    }
    else {
      sidebarFooter.style.display = 'flex';
    }

    if (this.layoutWrapper.nativeElement.offsetHeight <= 500 && this.pos_isAbsolute === false) {
      this.pos_isAbsolute = true;
      if (this.sidebarVisible === true) {
        this.toggleSidebar();
      }
    } 
    else if (this.layoutWrapper.nativeElement.offsetHeight > 500 && this.pos_isAbsolute === true) {
      if (this.sidebarVisible === false) {
        this.toggleSidebar();
      }
      this.pos_isAbsolute = false;
    }
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;

    const sidebar = document.querySelector('app-side-bar-left') as HTMLElement;

    if (sidebar && this.sidebarVisible) {
      sidebar.style.display = 'block';
      sidebar.classList.remove('hide');
    } else {
      sidebar.classList.add('hide');
      setTimeout(() => {
        sidebar.style.display = 'none';
      }, 400);
    }
  }
}