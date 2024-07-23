import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../service/auth.service";
import { CartService } from '../../service/cart.service';
import { OAuth2Service } from '../../service/oauth2.service';
import { ErrorDialogComponent } from "../error-dialog/error-dialog.component";
import { ModalContentComponent } from "../modal-content/modal-content.component";

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatProgressSpinner],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})

export class AuthComponent implements OnInit {
  @ViewChild('container') container!: ElementRef;
  registerForm: FormGroup;
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialog: MatDialog,
    private renderer: Renderer2,
    private router: Router,
    private route: ActivatedRoute,
    private oauth2Service: OAuth2Service,
    private cartService: CartService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[^0-9]{3,}$'), this.noLeadingTrailingSpaces]],
      lastName: ['', [Validators.required, Validators.pattern('^[^0-9]{3,}$'), this.noLeadingTrailingSpaces]],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: ['', [Validators.required, Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$')]],
      gender: ['', Validators.required]
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern('^(.+)@(.+)$')]],
      password: ['', Validators.required]
    });
  }

  noLeadingTrailingSpaces(control: any) {
    if (control.value && (control.value.startsWith(' ') || control.value.endsWith(' '))) {
      return { 'trimmed': true };
    }
    return null;
  }

  signIn() {
    this.container.nativeElement.classList.remove('right-panel-active');
  }

  signUp() {
    this.container.nativeElement.classList.add('right-panel-active');
  }

  showSignIn() {
    this.renderer.removeClass(this.container.nativeElement, 'right-panel-active');
  }

  showSignUp() {
    this.renderer.addClass(this.container.nativeElement, 'right-panel-active');
  }

  loading: boolean = true;
  isLogin: boolean = this.authService.isLoggedIn();

  ngOnInit(): void {
    // Handle the route parameter or query parameter to extract token and other data
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const message = params['message'];
      const role = params['role'];
      if (token) {
        this.authService.saveToken(token);
        this.cartService.syncCartFromLocalStorage();
        if (params['newUser'] === 'true') {
          this.router.navigate(['/']);
          localStorage.setItem('firstPwdSet', "false");
        } else {
          this.router.navigate(['/']);
        }
      }
    });

    if (this.isLogin) {
      this.router.navigate(['/']);
    }

    // Simulate loading for 2 seconds
    setTimeout(() => {
      this.loading = false; // Set loading to false after 2 seconds
    }, 200);
  }

  login() {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email.trim();
      const password = this.loginForm.value.password.trim();

      this.authService.login(email, password).subscribe(
        response => {
          console.log('Login successful', response);
          this.cartService.syncCartFromLocalStorage();
          this.authService.saveToken(response.token);
          localStorage.setItem('firstPwdSet', 'true');
          this.router.navigate(['/']);
        },
        error => {
          console.error('Login error', error);
          let msg = Object.values(error.error.errors).join(', ');
          this.showErrorDialog(msg);
        }
      );
    }
  }

  register() {
    if (this.registerForm.valid) {
      const firstName = this.registerForm.value.firstName.trim();
      const lastName = this.registerForm.value.lastName.trim();
      const email = this.registerForm.value.email.trim();
      const password = this.registerForm.value.password.trim();
      const gender = this.registerForm.value.gender;

      this.authService.register(firstName, lastName, email, password, gender).subscribe(
        response => {
          console.log('Registration successful', response);
          this.authService.saveToken(response.token);
          localStorage.setItem('firstPwdSet', 'true');
          this.router.navigate(['/']);
        },
        error => {
          console.error('Registration error', error);
          let msg = Object.values(error.error.errors).join(', ');
          this.showErrorDialog(msg);
        }
      );
    }
  }

  showErrorDialog(message: string): void {
    this.dialog.open(ErrorDialogComponent, {
      width: '350px',
      height: '200px',
      data: { message: message },
    });
  }

  isDialogOpen: boolean = false;

  openDialog(): void {
    if (this.isDialogOpen) {
      return; // Exit function if dialog is already open
    }

    this.isDialogOpen = true;

    const dialogRef = this.dialog.open(ModalContentComponent, {
      width: '350px',
      height: '270px',
      data: { name: 'Send Reset Password' },
      panelClass: 'custom-dialog-container'  // Apply the custom class here
    });

    dialogRef.afterOpened().subscribe(() => {
      const dialogContainer = document.querySelector('.cdk-overlay-pane') as HTMLElement;

      // Hide the dialog initially
      dialogContainer.style.display = 'none';

      // Apply new styles to the dialog container
      this.renderer.setStyle(dialogContainer, 'position', 'relative');
      this.renderer.setStyle(dialogContainer, 'top', '0px');
      this.renderer.setStyle(dialogContainer, 'z-index', '100');

      // Show the dialog after applying styles
      dialogContainer.style.display = 'block';
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.isDialogOpen = false;
    });
  }

  initiateGoogleLogin() {
    this.oauth2Service.initiateGoogleLogin();
  }

  initiateFaceLogin() {
    this.oauth2Service.initiateFaceLogin();
  }
}