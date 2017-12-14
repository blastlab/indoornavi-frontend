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
    service.loadCompleted().subscribe(loaded => {
      expect(loaded).toBeFalsy();
    });
    service.publishIsLoaded(null);
  });

  it('Should inform that svg is loaded', () => {
    service.publishIsLoaded(null);
    service.loadCompleted().subscribe(loaded => {
      expect(loaded).toBeTruthy();
    });
  });
});
