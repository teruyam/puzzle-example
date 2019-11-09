import { TestBed } from '@angular/core/testing';

import { UserEntryService } from './user-entry.service';

describe('UserEntryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserEntryService = TestBed.get(UserEntryService);
    expect(service).toBeTruthy();
  });
});
