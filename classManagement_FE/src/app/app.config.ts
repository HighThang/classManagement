import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptor/auth.interceptor';
import { CalendarModule, DateAdapter } from 'angular-calendar'
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns'

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserAnimationsModule,
      CalendarModule.forRoot({
        provide: DateAdapter,
        useFactory: adapterFactory 
      }),
    ),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    provideZoneChangeDetection({eventCoalescing: true}), 
    provideRouter(routes),
  ]
};
