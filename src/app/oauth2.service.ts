import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class OAuth2Service {

  private baseUrl = 'http://localhost:8080'; // Replace with your Spring Boot backend URL

  constructor(private http: HttpClient, private router: Router) { }

  initiateGoogleLogin() {
    window.location.href = `${this.baseUrl}/oauth2/authorization/google`;
  }


    initiateFaceLogin() {
    window.location.href = `${this.baseUrl}/oauth2/authorization/facebook`;
  }


}