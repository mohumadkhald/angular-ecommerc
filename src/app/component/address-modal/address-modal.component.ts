import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-address-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address-modal.component.html',
  styleUrl: './address-modal.component.css',
})
export class AddressModalComponent {
  addressForm: FormGroup | any;

  constructor(
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.addressForm = this.formBuilder.group({
      street: ['', Validators.required],
      city: [null, Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required,],
      country: [null, Validators.required],
    });
  }

  onSubmit(): void {
    if (this.addressForm.invalid) {
      this.markAllAsTouched();
      return;
    }
    const formData = new FormData();
    formData.append('street', this.addressForm.get('street').value);
    formData.append('city', this.addressForm.get('city').value);
    formData.append('state', this.addressForm.get('state').value);
    formData.append('postalCode', this.addressForm.get('postalCode').value);
    formData.append('country', this.addressForm.get('country').value);
    this.activeModal.close(this.addressForm.value);
  }

  markAllAsTouched(): void {
    Object.keys(this.addressForm.controls).forEach((field) => {
      const control = this.addressForm.get(field);
      control.markAsTouched({ onlySelf: true });
    });
  }

  onClose(): void {
    this.activeModal.close();
  }
}
