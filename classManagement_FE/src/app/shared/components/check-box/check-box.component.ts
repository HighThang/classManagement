import { Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-check-box',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, FormsModule],
  templateUrl: './check-box.component.html',
  styleUrls: ['./check-box.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckBoxComponent),
      multi: true,
    },
  ],
})
export class CheckBoxComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() disable = false;

  value: boolean = false;

  onChange = (value: boolean) => {
    this.value = value;
  };
  onTouched = () => {};

  registerOnChange(fn: () => boolean): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(value: boolean): void {
    this.value = value;
  }

  handleChange(value: MatCheckboxChange) {
    this.onChange(value.checked);
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disable = isDisabled;
  }
}
