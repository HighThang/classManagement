import { Injectable } from '@angular/core';
import { ITheme } from '../../interfaces/theme.interface';
import { EThemeColors, EThemeNames } from '../../enums/theme.enum';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private defaultTheme: ITheme = { nameTheme: EThemeNames.Cornflowerblue, color: EThemeColors.Cornflowerblue };

  themes: ITheme[] = [
    { nameTheme: EThemeNames.Cornflowerblue, color: EThemeColors.Cornflowerblue },
    { nameTheme: EThemeNames.Orange, color: EThemeColors.Orange },
    { nameTheme: EThemeNames.LightGreen, color: EThemeColors.LightGreen }
  ];
  
  constructor() {
      const storedTheme = localStorage.getItem('theme');
      if (!storedTheme) {
        localStorage.setItem('theme', JSON.stringify(this.defaultTheme));
      } else {
        this.applyTheme(this.getTheme());
      }
  }

  getThemes(): ITheme[] {
    return this.themes;
  }

  getTheme(): ITheme {
      const storedTheme = localStorage.getItem('theme');
      return storedTheme ? JSON.parse(storedTheme) : this.defaultTheme;
  }

  setTheme(theme: ITheme): void {
      localStorage.setItem('theme', JSON.stringify(theme));
      this.applyTheme(theme);
  }

  private applyTheme(theme: ITheme): void {
      document.documentElement.classList.remove('theme-cornflowerblue', 'theme-orange', 'theme-lightgreen');
      document.documentElement.classList.add(`theme-${theme.color.toLowerCase()}`);
  }
}
