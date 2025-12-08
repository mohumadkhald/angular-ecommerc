import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toastMessages: { message: string, type: 'success' | 'error' | 'warning' }[] = [];
  timeoutMap = new Map<string, any>();
  removeDelay = 8000; // Initial delay for the first message
  incrementDelay = 3000; // Incremental delay for each subsequent message

  // Single method for adding messages of any type
  add(message: string, type: 'success' | 'error' | 'warning') {
    this.toastMessages.push({ message, type });
    this.setAutoRemove(message, type);
  }

  // Auto remove message after an incremental delay
  private setAutoRemove(message: string, type: string) {
    // Set the timeout for this message based on the current delay
    const timeoutId = setTimeout(() => this.remove(message, type), this.removeDelay);
    
    // Store the timeout ID for this message
    this.timeoutMap.set(message, timeoutId);
    
    // After removing the message, update the delay for the next message
    this.removeDelay += this.incrementDelay;
  }

  // Remove message from the list
  remove(message: string, type: string): void {
    const index = this.toastMessages.findIndex((msg) => msg.message === message && msg.type === type);
    if (index > -1) {
      this.toastMessages.splice(index, 1);
    }
  }

  // Get the background color based on message type
  getMessageColor(type: 'success' | 'error' | 'warning'): string {
    switch (type) {
      case 'error':
        return 'rgb(202, 23, 11)'; // Red for error
      case 'warning':
        return 'rgb(187, 117, 13)'; // Yellow for warning
      case 'success':
        return 'rgb(61, 106, 29)'; // Green for success
      default:
        return 'rgb(0, 0, 0)'; // Default (black) color if type is unknown
    }
  }
}
