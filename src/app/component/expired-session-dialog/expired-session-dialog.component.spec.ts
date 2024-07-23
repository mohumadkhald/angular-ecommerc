import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiredSessionDialogComponent } from './expired-session-dialog.component';

describe('ExpiredSessionDialogComponent', () => {
  let component: ExpiredSessionDialogComponent;
  let fixture: ComponentFixture<ExpiredSessionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiredSessionDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpiredSessionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
