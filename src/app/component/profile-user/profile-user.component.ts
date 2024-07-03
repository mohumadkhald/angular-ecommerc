import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
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
export class ProfileUserComponent {
  constructor(
    private authService: AuthService,
     private router: Router,
     private modalService: NgbModal,
     public toastService: ToastService

    ) {}

  user:any;

  ngOnInit(): void {
      this.authService.getProfile().subscribe(
        response => {
          console.log('profile successful', response);
          this.user = response;
        },
        error => {
          console.error('profile error', error);
        }
      );
  }

  open(user: any) {
    const modalRef = this.modalService.open(EditUserModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.user = user;
    modalRef.result.then(
      (result) => {
        this.toastService.add('user edit success');

      },
      (reason) => {
        console.log('Modal dismissed:', reason);
      }
    );
  }
}
