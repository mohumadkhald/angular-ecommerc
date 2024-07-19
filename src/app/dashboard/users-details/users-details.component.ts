import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../dashboard-service/users.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-users-details',
  standalone: true,
  imports: [NgIf],
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
        console.log(this.user);
      } else {
        console.error('No products found in the response.');
      }
    })
  }

  getUserDetails(userId: number): void {
    this.usersService.getUserDetails(userId, this.token).subscribe(
      data => {
        this.user = data;
        console.log(this.user);
      },
      error => {
        console.error('Error fetching user details', error);
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
        console.log(response);
      }, error => {
        console.error(error);
      });
  }
}