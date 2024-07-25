import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../service/auth.service';
import { ToastService } from '../../service/toast.service';
import { EditUserModalComponent } from '../edit-user-modal/edit-user-modal.component';

@Component({
  selector: 'app-profile-user',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './profile-user.component.html',
  styleUrl: './profile-user.component.css'
})
export class ProfileUserComponent implements OnInit {
  user: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: NgbModal,
    public toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.authService.getProfile().subscribe(
      response => {
        this.user = response;
      },
      error => {
        console.error('Error loading user profile', error);
      }
    );
  }

  open(user: any) {
    const modalRef = this.modalService.open(EditUserModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.user = user;

    modalRef.result.then(
      (result) => {
        if (result === 'updated') {
          this.toastService.add('User edit success');
          this.loadUserProfile(); // Reload user profile after update
        }
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
      }
    ).catch((error) => {
      console.error('Modal error:', error);
    });
  }
}
