import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {CommonModule, DatePipe} from '@angular/common';
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule, NoopAnimationsModule, provideAnimations} from "@angular/platform-browser/animations";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthInterceptor } from './utils/auth.interceptor';
import {NgxImgZoomModule} from "ngx-img-zoom";
import { provideToastr } from 'ngx-toastr';
import { delayInterceptor } from './delay.interceptor';
import { httpCacheInterceptor } from './http-cache.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(), // required animations providers
    provideToastr(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withFetch()),
    DatePipe,
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    NgxImgZoomModule,
    provideAnimations(),
    provideHttpClient(withInterceptors([
      delayInterceptor,
      // httpCacheInterceptor,
      AuthInterceptor
    ])), provideAnimationsAsync(), provideAnimationsAsync(),
  ]
};
