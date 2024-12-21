import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() type: ButtonTypes = 'primary';
  @Input() disabled: boolean = false; 
  @Input() size: ButtonSize = 'medium';

  constructor() {}
}

export type ButtonTypes = 'primary' | 'success' | 'warning' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';
