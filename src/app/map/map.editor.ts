import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import * as d3 from "d3";

@Component({
  selector: 'app-map-editor',
  templateUrl: './map.html',
  styleUrls: ['./map.css']
})
export class MapComponent implements OnInit {

  private w = window.innerWidth;
  private h = window.innerHeight;
  public jsonTable = [];
  public circlesTable = [];
  private holder = d3.select("body")
    .append("svg")
    .datum(this.jsonTable)
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
    let floorMap = d3.select("svg.floor-map")
      .on("click", () => {
      this.drawPoint(10, 'rgba(150,50,235,0.6)');
      console.log('floorMap click event'); // CLDD in action
      // Work in progress - here decision what to draw
      });
    floorMap
      .style("position", "absolute")
      .style("top", 0)
      .style("left", 0);
  }

  drawPoint(size: number, color: string): void {
    let floorMap = d3.select("svg.floor-map");
    let x: number = d3.event.offsetX;
    let y: number = d3.event.offsetY;
    floorMap.append("circle")
      .datum(this.circlesTable)
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", size)
      .style("fill", color)
      .on("click", (datum) => {
        d3.drag(this);
        console.log('appended circle click/drag event'); // CLDD in action
        console.log(datum);
      });
  }
}
