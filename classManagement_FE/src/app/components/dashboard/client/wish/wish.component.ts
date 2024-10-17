import { Component, EventEmitter, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-wish',
  standalone: true,
  imports: [SharedModule, MatInputModule],
  templateUrl: './wish.component.html',
  styleUrl: './wish.component.scss'
})
export class WishComponent {

}
