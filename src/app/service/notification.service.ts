import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {
    this.requestPermission();
  }

  // Ask user for permission
  requestPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then((result) => {
        // console.log('Notification permission:', result);
      });
    } else {
      console.warn('Browser does not support notifications');
    }
  }

  // Show a desktop notification
  showNotification(title: string, body: string) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const notification = new Notification(title, {
      body: body,
      icon: 'assets/icons/bell.png', // optional icon
    });

    notification.onclick = () => {
      window.focus();
    };
  }
}
