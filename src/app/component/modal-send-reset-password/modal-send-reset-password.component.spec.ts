import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalContentComponent } from './modal-send-reset-password.component';

describe('ModalContentComponent', () => {
  let component: ModalContentComponent;
  let fixture: ComponentFixture<ModalContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalContentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
