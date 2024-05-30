import {Component, OnInit} from '@angular/core';
import {QuantityService} from "../../service/counter.service";
import {AuthService} from "../../service/auth.service";
import {Router} from "@angular/router";
import {error} from "@angular/compiler-cli/src/transformers/util";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{

  constructor(private authService: AuthService, private router: Router) {}


  ngOnInit(): void {
      this.authService.getProfile().subscribe(
        response => {
          console.log('profile successful', response);
        },
        error => {
          console.error('profile error', error);
        }
      );
  }

}
