import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class OAuth2Service {

  private baseUrl = 'https://ec2-13-245-71-72.af-south-1.compute.amazonaws.com:8443';
  // private baseUrl = "http://localhost:8080";

  constructor(private http: HttpClient, private router: Router) { }

  initiateGoogleLogin() {
    window.location.href = `${this.baseUrl}/oauth2/authorization/google`;
  }


    initiateFaceLogin() {
    window.location.href = `${this.baseUrl}/oauth2/authorization/facebook`;
  }


}
