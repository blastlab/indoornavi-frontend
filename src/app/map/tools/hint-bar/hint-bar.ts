import {Component, OnInit} from '@angular/core';
import {ToolsEnum} from '../tools.enum';

@Component({
  selector: 'app-hint-bar',
  templateUrl: './hint-bar.html',
  styleUrls: ['./hint-bar.css']
})
export class HintBarComponent implements OnInit {
  public tool: ToolsEnum = ToolsEnum['NONE'];
  constructor() { }

  ngOnInit() {
  }

}
