import { TestBed, inject } from '@angular/core/testing';

import { HeatMapControllerService } from './heat-map-controller.service';

describe('HeatMapControllerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HeatMapControllerService]
    });
  });

  it('should be created', inject([HeatMapControllerService], (service: HeatMapControllerService) => {
    expect(service).toBeTruthy();
  }));
});
