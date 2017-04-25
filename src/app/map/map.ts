import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import * as d3 from "d3";

@Component({
  selector: 'app-root',
  templateUrl: './map.html',
  styleUrls: ['./map.css']
})
export class MapComponent implements OnInit {

  private w = window.innerWidth;
  private h = window.innerHeight;
  private holder = d3.select("body")
    .append("svg")
    .attr("class", "floor-map")
    .attr("width", this.w)
    .attr("height", this.h);

  ngOnInit(): void {
    this.initMap();
    this.translate.setDefaultLang('en');
  }

  constructor(private router: Router,
              private route: ActivatedRoute,
              public translate: TranslateService) {
  }

  private initMap(): void {
    let floorMap = d3.select("svg.floor-map").on("click", () => {
      this.drawPoint(15, 'red');
    });
  }

  drawPoint(size: number, color: string): void {
    let floorMap = d3.select("svg.floor-map");
    let x: number = d3.event.offsetX;
    let y: number = d3.event.offsetY;
    floorMap.append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", size)
      .style("fill", color);
  }
}
