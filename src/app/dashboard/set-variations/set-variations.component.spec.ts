import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetVariationsComponent } from './set-variations.component';

describe('SetVariationsComponent', () => {
  let component: SetVariationsComponent;
  let fixture: ComponentFixture<SetVariationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetVariationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SetVariationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
