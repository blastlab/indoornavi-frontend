import {IconService} from './icon.service';
import {DomSanitizer, ɵe as DomSanitizerImpl} from '@angular/platform-browser';
import {MdIconRegistry} from '@angular/material';
import {Http, RequestOptions} from '@angular/http';
import {MockBackend} from '@angular/http/testing';

describe('IconService', () => {
  let service: IconService;
  const http: Http = new Http(new MockBackend(), new RequestOptions());
  const sanitizer: DomSanitizer = new DomSanitizerImpl({});
  const iconRegistry: MdIconRegistry = new MdIconRegistry(http, sanitizer);

  beforeEach(() => {
    service = new IconService(iconRegistry, sanitizer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});
