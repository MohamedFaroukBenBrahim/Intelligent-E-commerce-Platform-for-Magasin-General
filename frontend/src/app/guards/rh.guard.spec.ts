import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { rHGuard } from './rh.guard';

describe('rHGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => rHGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
