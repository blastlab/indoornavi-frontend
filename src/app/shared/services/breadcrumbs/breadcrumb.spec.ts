import {BreadcrumbService} from './breadcrumb.service';

describe('BreadcrumbService', () => {
  // given
  let breadcrumbService: BreadcrumbService;
  // when
  beforeEach(() => {
    // mocking items being passed to breadcrumbService
    breadcrumbService = new BreadcrumbService;
    breadcrumbService.publishIsReady([
      {label: 'main page', disabled: true},
      {label: 'buildings', disabled: true}
    ]);
  });
  it('should set to subscription and return from subscription proper set of data', () => {
    breadcrumbService.isReady().subscribe( breadcrumbs => {
      // then
      expect(breadcrumbs).toEqual([]);
      expect(breadcrumbs).toContain('main page');
      expect(breadcrumbs).toContain('buildings');
      expect(breadcrumbs).toContain(true);
    });
  });
  it('should not return from subscription data that are not set as observable in subscription', () => {
    breadcrumbService.isReady().subscribe( breadcrumbs => {
      // then
      expect(breadcrumbs).toEqual([]);
      expect(breadcrumbs).not.toContain('floor');
    });
  });
  it('should reload observable in subscription each time it receives new data', () => {
    // when
    breadcrumbService.publishIsReady([
      {label: 'floors', disabled: false},
      {label: 'buildings', disabled: false}
    ]);
    breadcrumbService.isReady().subscribe( breadcrumbs => {
      // then
      expect(breadcrumbs).toEqual([]);
      expect(breadcrumbs).not.toContain('main page');
      expect(breadcrumbs).toContain('floor');
      expect(breadcrumbs).toContain('buildings');
      expect(breadcrumbs).not.toContain(true);
      expect(breadcrumbs).toContain(false);
    });
  });

});
