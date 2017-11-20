import * as d3 from 'd3';
import {IconService} from './icon.service';
import {DrawingService} from './drawing.service';
import {inject, TestBed} from '@angular/core/testing';
import {MdIconRegistry} from '@angular/material';
import {ConnectionBackend, Http, HttpModule, RequestOptions} from '@angular/http';

describe('Service: DrawingService', () => {
  let drawService: DrawingService;
  let iconService: IconService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
      providers: [DrawingService, IconService, MdIconRegistry, Http, ConnectionBackend, RequestOptions]
    });
  });
  beforeEach(inject([DrawingService], drawingService => {
    drawService = drawingService(iconService);
  }));
  afterEach(() => {
    d3.selectAll('svg').remove();
  });
  it('should draw object as an icon', () => {
    const objectParams = {
      id: '01',
      iconName: 'communication',
      groupClass: 'anchor',
      markerClass: 'class'
    };
    const position = {x: 10, y: 10};
    // spyOn(icons, 'getIcon').and.returnValue('device');
    // drawService = new DrawingService(icons);
    console.log(drawService.drawObject(objectParams, position));
  });
});
