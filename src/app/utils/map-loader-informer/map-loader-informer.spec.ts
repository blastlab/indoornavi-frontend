import {MapLoaderInformerService} from './map-loader-informer.service';

describe('MapLoaderInformerService', () => {
  let service: MapLoaderInformerService;

  beforeEach(() => {
    service = new MapLoaderInformerService();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });



  it('Should inform that svg is NOT loaded', () => {
    service.isLoaded$.subscribe(loaded => {
      expect(loaded).toBeFalsy();
    });
    service.publishIsLoaded(false);
  });

  it('Should inform that svg is loaded', () => {
    service.publishIsLoaded(true);
    service.isLoaded$.subscribe(loaded => {
      expect(loaded).toBeTruthy();
    });
  });
});