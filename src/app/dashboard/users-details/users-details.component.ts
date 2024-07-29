import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../dashboard-service/users.service';
import { NgIf } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-users-details',
  standalone: true,
  imports: [NgIf, SidebarComponent, MatProgressSpinner],
  templateUrl: './users-details.component.html',
  styleUrl: './users-details.component.css'
})
export class UsersDetailsComponent implements OnInit {

  @Input() id !: number;
  user: any;
  loading: boolean = true;


  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService
  ) { }

  ngOnInit(): void {
    this.getUserDetails(this.id)
  }

  getUserDetails(userId: number): void {
    this.usersService.getUserDetails(userId).subscribe(
      data => {
        this.user = data;
        this.loading = false;
      },
      error => {
        this.loading = false;
      }
    );
  }

  toggleAccountNonExpired() {
    this.user.credential.accountNonExpired = !this.user.credential.accountNonExpired;
    this.updateUserStatus({ accNonExpire: this.user.credential.accountNonExpired });
  }

  toggleAccountNonLocked() {
    this.user.credential.accountNonLocked = !this.user.credential.accountNonLocked;
    this.updateUserStatus({ accNonLocked: this.user.credential.accountNonLocked });
  }

  toggleCredentialsNonExpired() {
    this.user.credential.credentialsNonExpired = !this.user.credential.credentialsNonExpired;
    this.updateUserStatus({ credentialNonExpire: this.user.credential.credentialsNonExpired });
  }

  updateUserStatus(params: any) {
    this.usersService.updateUserStatus(this.user.userId, params)
      .subscribe(response => {
      }, error => {
      });
  }
}