import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../dashboard-service/users.service';
import { NgIf } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-users-details',
  standalone: true,
  imports: [NgIf, SidebarComponent],
  templateUrl: './users-details.component.html',
  styleUrl: './users-details.component.css'
})
export class UsersDetailsComponent implements OnInit {

  @Input() id !: number;
  user: any;
  token: any = localStorage.getItem('token'); // Replace this with the actual token retrieval logic

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService
  ) { }

  ngOnInit(): void {
    this.usersService.getUserDetails(this.id, this.token).subscribe((res) => {
      if (res) {
        this.user = res;
      } else {
      }
    })
  }

  getUserDetails(userId: number): void {
    this.usersService.getUserDetails(userId, this.token).subscribe(
      data => {
        this.user = data;
      },
      error => {
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
    this.usersService.updateUserStatus(this.user.userId, params, this.token)
      .subscribe(response => {
      }, error => {
      });
  }
}