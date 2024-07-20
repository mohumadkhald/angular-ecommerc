import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryUpdateService {
  private categorySubject = new BehaviorSubject<void>(undefined);
  categoryUpdated$ = this.categorySubject.asObservable();

  notifyCategoryUpdate() {
    this.categorySubject.next(); // Emit an event with no value
  }
}