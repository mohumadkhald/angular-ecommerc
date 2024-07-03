import { ChangeDetectorRef, Component, Input, NgZone, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-user-modal.component.html',
  styleUrl: './edit-user-modal.component.css'
})
export class EditUserModalComponent {
  @Input() user: any; // Input property for receiving user details
  originalUser: any; // To store original user details for comparison or rollback purposes
  selectedSize: string = '';
  selectedColor: string = '';
  scaleRange: number = 1;
  xValue: number = 0;
  yValue: number = 0;

  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private userService: UserService,
    private router: Router,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Make a copy of the original user object to enable rollback on cancel
    this.originalUser = { ...this.user };
  }

  saveChanges() {
    // Implement logic to save changes (e.g., call a service to update user details)
    console.log('Saving changes', this.user);
    this.userService.updateProfile(this.user).subscribe(
      response => {
        this.router.navigate(['/user/profile']);
      },
      error => {
        console.log(error);
      }
    )
  
    // Close the modal after saving changes
    this.activeModal.close(this.user); // Pass any data back to the caller if needed
  }

  disableAutocomplete(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      this.renderer.setAttribute(element, 'autocomplete', 'off');
    }
  }

  close() {
    // Implement logic to handle modal close (e.g., rollback changes if needed)
    console.log('Closing modal');
    // Rollback changes if the user cancels editing
    Object.assign(this.user, this.originalUser); // Restore original values
    this.activeModal.dismiss('cancel');
  }
}
