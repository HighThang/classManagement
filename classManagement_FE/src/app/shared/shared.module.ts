import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../shared/components/button/button.component';
import { TextFieldComponent } from '../shared/components/text-field/text-field.component';
import { CheckBoxComponent } from './components/check-box/check-box.component';
import { IconComponent } from './components/icon/icon.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ButtonComponent,
    TextFieldComponent,
    CheckBoxComponent,
    IconComponent
  ],
  exports: [
    ButtonComponent,
    TextFieldComponent,
    CheckBoxComponent,
    IconComponent
  ],
})
export class SharedModule { }
