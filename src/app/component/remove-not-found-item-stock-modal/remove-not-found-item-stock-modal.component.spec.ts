import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveNotFoundItemStockModalComponent } from './remove-not-found-item-stock-modal.component';

describe('RemoveNotFoundItemStockModalComponent', () => {
  let component: RemoveNotFoundItemStockModalComponent;
  let fixture: ComponentFixture<RemoveNotFoundItemStockModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoveNotFoundItemStockModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RemoveNotFoundItemStockModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
