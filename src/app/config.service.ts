import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  // private apiUri = 'https://ec2-13-245-71-72.af-south-1.compute.amazonaws.com:8443/api';
  private apiUri = 'http://localhost:8080/api';

  getApiUri(): string {
    return this.apiUri;
  }
}
