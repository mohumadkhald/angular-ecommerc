import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private apiUri = 'http://ec2-13-245-4-191.af-south-1.compute.amazonaws.com:8443/api';
  // private apiUri = 'http://localhost:8080/api';

  // private apiUri = 'http://192.168.49.2:30001/api';
  getApiUri(): string {
    return this.apiUri;
  }
}
