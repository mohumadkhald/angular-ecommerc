import { TestBed } from '@angular/core/testing';

import { BackendEventsService } from './backend-events.service';

describe('BackendEventsService', () => {
  let service: BackendEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackendEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
