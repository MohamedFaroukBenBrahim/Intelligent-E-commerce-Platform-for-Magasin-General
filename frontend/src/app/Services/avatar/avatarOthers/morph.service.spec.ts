import { TestBed } from '@angular/core/testing';

import { MorphService } from './morph.service';

describe('MorphService', () => {
  let service: MorphService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MorphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
