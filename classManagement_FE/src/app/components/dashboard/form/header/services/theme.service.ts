import { Injectable } from '@angular/core';
import { ITheme } from '../../../../../core/interfaces/theme.interface';
import { EThemeColors, EThemeNames } from '../../../../../core/enums/theme.enum';

@Injectable()
export class ThemeService {
  private defaultTheme: ITheme = { nameTheme: EThemeNames.Cornflowerblue, color: EThemeColors.Cornflowerblue };

  themes: ITheme[] = [
    { nameTheme: EThemeNames.Cornflowerblue, color: EThemeColors.Cornflowerblue },
    { nameTheme: EThemeNames.Red, color: EThemeColors.Red },
    { nameTheme: EThemeNames.LightGreen, color: EThemeColors.LightGreen }
  ];
  
  constructor() {
    if (this.isBrowser()) {
      const storedTheme = localStorage.getItem('theme');
      if (!storedTheme) {
        localStorage.setItem('theme', JSON.stringify(this.defaultTheme));
      } else {
        this.applyTheme(this.getTheme());
      }
    }
  }

  getThemes(): ITheme[] {
    return this.themes;
  }

  getTheme(): ITheme {
    if (this.isBrowser()) {
      const storedTheme = localStorage.getItem('theme');
      return storedTheme ? JSON.parse(storedTheme) : this.defaultTheme;
    }
    return this.defaultTheme;
  }

  setTheme(theme: ITheme): void {
    if (this.isBrowser()) {
      localStorage.setItem('theme', JSON.stringify(theme));
      this.applyTheme(theme);
    }
  }

  private applyTheme(theme: ITheme): void {
    if (this.isBrowser()) {
      document.documentElement.classList.remove('theme-cornflowerblue', 'theme-red', 'theme-lightgreen');
      document.documentElement.classList.add(`theme-${theme.nameTheme.toLowerCase()}`);
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
