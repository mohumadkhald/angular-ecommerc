import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../dashboard-service/users.service';
import { AuthService } from '../../service/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AddUserComponent } from '../add-user/add-user.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../service/toast.service';
import { DashboardComponent } from '../dashboard.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  token: any = ''; // Initialize with an empty string or get from authService

  constructor(
    private router: Router,
    private usersService: UsersService,
    private authService: AuthService,
    private modalService: NgbModal,
    public toastService: ToastService,
    private dashboardComponent: DashboardComponent // Inject DashboardComponent
  ) { }

  ngOnInit(): void {
    this.token = this.authService.getToken(); // Get the token
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.usersService.getUsers(this.token).subscribe(
      (data) => {
        this.users = data.data; // Assuming data contains the users array
      },
      (error) => {
        console.error('Error fetching users', error);
      }
    );
  }

  deleteUser(userId: number): void {
    this.usersService.deleteUser(userId, this.token).subscribe(
      (data) => {
        // Filter out the deleted user from the array
        this.users = this.users.filter(user => user.id !== userId);
        this.dashboardComponent.fetchUserCount(); // Update the user count
        console.log(data);
      },
      (error) => {
        console.error('Error deleting user:', error);
      }
    );
  }

  detailsUser(userId: number): void {
    this.router.navigate([`dashboard/users/${userId}`]);
  }

  open() {
    const modalRef = this.modalService.open(AddUserComponent, { size: 'lg', centered: true });

    modalRef.componentInstance.userAdded.subscribe(() => {
      this.fetchUsers(); // Refresh the users list
      this.dashboardComponent.fetchUserCount(); // Update the user count
      this.toastService.add('User Added successfully');
    });

    modalRef.result.then(
      (result) => {
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
      }
    );
  }
}
