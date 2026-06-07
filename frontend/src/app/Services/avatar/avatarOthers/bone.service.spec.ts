import { TestBed } from '@angular/core/testing';

import { BoneService } from './bone.service';

describe('BoneService', () => {
  let service: BoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
