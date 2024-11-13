import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { CartService } from '../../service/cart.service';
import { OAuth2Service } from '../../service/oauth2.service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { ModalSendResetPasswordComponent } from '../modal-send-reset-password/modal-send-reset-password.component';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinner,
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})

export class AuthComponent implements OnInit {
  @ViewChild('container') container!: ElementRef;

  registerForm: FormGroup;
  loginForm: FormGroup;
  loading: boolean = true; // Spinner visibility
  isLogin!: boolean; // Check if the user is logged in
  formErrors: any = {}; // Store form errors
  isDialogOpen: boolean = false; // Track if the modal is open

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialog: MatDialog,
    private renderer: Renderer2,
    private router: Router,
    private route: ActivatedRoute,
    private oauth2Service: OAuth2Service,
    private cartService: CartService,
    private toast: ToastService
  ) {
    // Initialize forms with validation rules
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[^0-9]{3,}$'), this.noLeadingTrailingSpaces]],
      lastName: ['', [Validators.required, Validators.pattern('^[^0-9]{3,}$'), this.noLeadingTrailingSpaces]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$')]],
      gender: ['', Validators.required],
      role: ['', Validators.required],
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: []
    });
  }

  ngOnInit(): void {
    this.isLogin = this.authService.isLoggedIn();

    // Redirect if already logged in
    if (this.isLogin) {
      this.router.navigate(['/']);
      return; // Exit to prevent unnecessary further processing
    }

    // Handle query params to toggle between login/register
    this.route.queryParams.subscribe((params) => {
      const state = params['state'];
      // Show appropriate form based on the query parameter
      if (state === 'register') {
        setTimeout(() => {
        this.showSignUp();
        }, 600);
      } else {
        this.showSignIn();
      }

      // Handle token if present (for navigation after registration)
      const token = params['token'];
      const role = params['role'];
      if (token) {
        this.authService.saveToken(token);
        this.authService.saveRole(role);
        if (params['newUser'] === 'true') {
          localStorage.setItem('firstPwdSet', 'true');
        }
        this.router.navigate(['/']);
      }
    });

    // Show loading spinner
    setTimeout(() => {
      this.loading = false; // End loading after a specified time
    }, 500);
  }

  // Form validation helper
  noLeadingTrailingSpaces(control: any) {
    const value = control.value || '';
    return value.trim() !== value ? { trimmed: true } : null;
  }

  // Toggle to show Sign In form
  showSignIn() {
    this.router.navigate(['/auth'], { queryParams: { state: 'login' } });
    this.renderer.removeClass(this.container.nativeElement, 'right-panel-active');
  }

  // Toggle to show Sign Up form
  showSignUp() {
    this.router.navigate(['/auth'], { queryParams: { state: 'register' } });
    this.renderer.addClass(this.container.nativeElement, 'right-panel-active');
  }

  // Login method
  login() {
    if (this.loginForm.valid) {
      const { email, password, remember } = this.loginForm.value;
      this.authService.login(email.trim(), password.trim(), remember).subscribe(
        (response) => {
          this.cartService.syncCartFromLocalStorage();
          this.cartService.clearCart();
          this.authService.saveToken(response.token);
          this.router.navigate(['/']);
          this.toast.add("Your Login Success Have a Nice Time")
        },
        (error) => this.handleError(error)
      );
    }
  }

  // Register method
  register() {
    if (this.registerForm.valid) {
      const { firstName, lastName, email, password, gender, role } = this.registerForm.value;
      this.authService.register(firstName.trim(), lastName.trim(), email.trim(), password.trim(), gender, role).subscribe(
        (response) => {
          this.authService.saveToken(response.token);
          this.router.navigate(['/']);
          this.cartService.syncCartFromLocalStorage();
          this.cartService.clearCart();
          this.toast.add("You Are Register Welcome To Ecommerc WebSite")
        },
        (error) => this.handleError(error)
      );
    }
  }

  handleError(error: any) {
    if (error.status === 400 && error.error.violations) {
      this.displayServerErrors(error.error.violations);
    } else {
      const msg = Object.values(error.error.errors).join(', ');
      this.showErrorDialog(msg);
    }
  }

  displayServerErrors(violations: any) {
    this.formErrors = {};
    violations.forEach((violation: any) => {
      this.formErrors[violation.fieldName] = violation.message;
    });
  }

  showErrorDialog(message: string): void {
    this.dialog.open(ErrorDialogComponent, {
      width: '350px',
      height: '200px',
      data: { message },
    });
  }

  openDialog(): void {
    if (this.isDialogOpen) return; // Exit if dialog is already open

    this.isDialogOpen = true;
    const dialogRef = this.dialog.open(ModalSendResetPasswordComponent, {
      width: '350px',
      height: '270px',
      data: { name: 'Send Reset Password' },
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.isDialogOpen = false;
    });
  }

  initiateGoogleLogin() {
    this.oauth2Service.initiateGoogleLogin();
  }

  initiateFaceLogin() {
    this.oauth2Service.initiateFaceLogin();
  }

  // Navigation functions
  navigateToSignIn() {
    this.router.navigate(['/auth'], { queryParams: { state: 'login' } });
    this.showSignIn();
  }

  navigateToSignUp() {
    this.router.navigate(['/auth'], { queryParams: { state: 'register' } });
    this.showSignUp();
  }
}