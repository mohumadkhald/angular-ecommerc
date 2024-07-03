import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toast: string | null = null;
  timeoutId: any;

  add(message: string) {
    this.toast = message;
    this.clearTimeout();
    this.timeoutId = setTimeout(() => this.remove(), 3000); // Automatically remove toast after 3 seconds
  }

  remove() {
    this.toast = null;
    this.clearTimeout();
  }

  private clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}