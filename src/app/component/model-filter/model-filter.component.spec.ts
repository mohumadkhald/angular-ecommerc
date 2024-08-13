import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelFilterComponent } from './model-filter.component';

describe('ModelFilterComponent', () => {
  let component: ModelFilterComponent;
  let fixture: ComponentFixture<ModelFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModelFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
