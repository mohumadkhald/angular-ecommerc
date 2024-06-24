import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener, OnChanges, OnDestroy,
  OnInit
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import {AuthService} from "../../service/auth.service";

import {error} from "@angular/compiler-cli/src/transformers/util";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {UserService} from "../../service/user.service";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor, NgIf, MatProgressSpinner],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  quantity: any = 0;
  username: string = '';
  img: string = '';
  loading: boolean = true;
  

  constructor(
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.username$.subscribe(username => {
      if (username) {
        this.username = username;
        this.loading = false;
        this.cd.detectChanges();  // Trigger change detection if needed
      }
    });
    this.userService.img$.subscribe(img => {
      if (img) {
        this.img = img;
        this.loading = false;
        this.cd.detectChanges();  // Trigger change detection if needed
        console.log(this.img)
      }
    });
    
    if (this.auth()) {
      this.userService.loadProfile().subscribe();
      console.log(this.userService.loadProfile().subscribe())
    }
  }

  logout() {
    this.authService.logout().subscribe(
      response => {
        console.log('Logout successful', response);
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Logout error', error);
      }
    );
  }

  auth(): boolean {
    return this.authService.isLoggedIn();
  }
}
