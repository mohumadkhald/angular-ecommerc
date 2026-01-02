import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class BackendEventsService {

  private wasBackendDown = false;
  apiUrl: string;
  constructor(configService: ConfigService) {
    this.apiUrl = configService.getApiUrl();
  }

  

  listenToBackendStatus() {
    const eventSource = new EventSource(`${this.apiUrl}/status-stream`, { withCredentials: true });

    eventSource.addEventListener('connected', () => {
      // console.log("Backend UP event");

      if (this.wasBackendDown) {
        this.wasBackendDown = false; // reset
        window.location.reload(); // reload only once after recovery
      }
    });

    eventSource.addEventListener('ping', () => {
      // console.log("Ping from backend");
    });

    eventSource.onerror = () => {
      console.warn("Lost connection to backend...");
      this.wasBackendDown = true; // mark backend as down
    };
  }
}
