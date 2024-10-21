import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationComponent } from '../../component/pagination/pagination.component';
import { UsersService } from '../../dashboard-service/users.service';
import { AuthService } from '../../service/auth.service';
import { ToastService } from '../../service/toast.service';
import { AddUserComponent } from '../add-user/add-user.component';
import { DashboardComponent } from '../dashboard.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [NgFor, NgIf, PaginationComponent, SidebarComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit, OnDestroy {
  users: any[] = [];
  token: any = '';
  currentPage = 1;
  totalPages: number[] = [];
  private authSubscription!: Subscription;

  constructor(
    private router: Router,
    private usersService: UsersService,
    private authService: AuthService,
    private modalService: NgbModal,
    public toastService: ToastService,
    private dashboardComponent: DashboardComponent // Inject DashboardComponent
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (isLoggedIn) => {
        console.log('Auth status changed:', isLoggedIn);
        if (isLoggedIn) {
          this.fetchUsers(this.currentPage - 1);
        }
      }
    );
  }
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  fetchUsers(page: number = 0, pageSize: number = 10): void {
    this.usersService.getUsers(page, pageSize).subscribe(
      (data) => {
        this.users = data.content;
        this.currentPage = data.pageable.pageNumber + 1;
        this.totalPages = Array.from(
          { length: data.totalPages },
          (_, i) => i + 1
        );
      },
      (error) => {
        console.error('Error fetching products', error);
      }
    );
  }
  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.usersService.deleteUser(userId).subscribe(
        () => {
          // Filter out the deleted user from the array
          this.users = this.users.filter((user) => user.id !== userId);
          this.dashboardComponent.fetchUserCount(); // Update the user count
          this.toastService.add('User Deleted successfully');
        },
        (error) => {}
      );
    }
  }

  detailsUser(userId: number): void {
    this.router.navigate([`dashboard/users/${userId}`]);
  }

  open() {
    const modalRef = this.modalService.open(AddUserComponent, {
      size: 'lg',
      centered: true,
    });

    modalRef.componentInstance.userAdded.subscribe(() => {
      this.fetchUsers(this.currentPage - 1); // Refresh the users list
      this.dashboardComponent.fetchUserCount(); // Update the user count
    });

    modalRef.result.then(
      (result) => {
        if (result === 'added') {
          this.toastService.add('User added successfully');
        }
      },
      (reason) => {}
    );
  }

  onPageChange(page: number): void {
    this.fetchUsers(page - 1);
  }

  auth(): boolean {
    return this.authService.isLoggedIn();
  }
}
