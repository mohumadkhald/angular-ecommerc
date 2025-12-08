import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ProfileSellerComponent } from '../profile-seller/profile-seller.component';
import { ProfileUserComponent } from '../profile-user/profile-user.component';
import { ToastService } from '../../service/toast.service';
import { ProfileAdminComponent } from '../profile-admin/profile-admin.component';
import { UserService } from '../../service/user.service';
import { Subscription } from 'rxjs';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  imports: [
    ProfileAdminComponent,
    ProfileSellerComponent,
    ProfileUserComponent,
    CommonModule,
    MatProgressSpinner
],
})
export class ProfileComponent implements OnInit, OnDestroy, AfterViewChecked {
  user: any;
  private authSubscription!: Subscription;
  loading: boolean = true;
  private profileLoaded = false;
  private viewRendered = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading = true;

    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (isLoggedIn) => {
        if (isLoggedIn) {
          this.loadUserProfile();
        } else {
          this.loading = false;
        }
      }
    );
  }

  private loadUserProfile(): void {
    this.loading = true;
    this.userService.loadProfile().subscribe({
      next: (response) => {
        this.user = response;
        this.profileLoaded = true; // triggers re-render
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.toastService.add('Failed to load profile', 'error');
        this.loading = false;
      },
    });
  }


  ngAfterViewChecked(): void {
    // Wait until profile data loaded & view rendered once
    if (this.profileLoaded && !this.viewRendered) {
      this.viewRendered = true;

      // Delay spinner stop for 5 seconds (to show smooth transition)
      setTimeout(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }, 200);
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  auth() {
    return this.authService.isLoggedIn();
  }
}