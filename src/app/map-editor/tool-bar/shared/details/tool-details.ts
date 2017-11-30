import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-tool-details',
  templateUrl: './tool-details.html',
  styleUrls: ['./tool-details.css']
})
export class ToolDetailsComponent implements OnInit {

  visible: boolean = false;

  constructor() {
  }

  ngOnInit() {
  }

  show(): void {
    this.visible = true;
  }

  hide(): void {
    this.visible = false;
  }

}
