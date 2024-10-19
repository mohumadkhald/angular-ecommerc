import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class OAuth2Service {

  // private baseUrl = 'https://ec2-13-245-4-191.af-south-1.compute.amazonaws.com:8443';
  private baseUrl = "http://localhost:8080";
    // private baseUrl = "http://192.168.49.2:30001"

  constructor(private http: HttpClient, private router: Router) { }

  initiateGoogleLogin() {
    window.location.href = `${this.baseUrl}/oauth2/authorization/google`;
  }


    initiateFaceLogin() {
    window.location.href = `${this.baseUrl}/oauth2/authorization/facebook`;
  }


}
