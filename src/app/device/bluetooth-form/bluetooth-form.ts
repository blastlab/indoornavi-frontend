import {Component, Input, AfterViewChecked, OnInit, DoCheck, Host, ViewChild} from '@angular/core';
import {ChangeDetectorRef} from '@angular/core';
import {SelectItem} from 'primeng/primeng';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-bluetooth-form',
  templateUrl: './bluetooth-form.html'
})

export class BluetoothFormComponent implements OnInit, AfterViewChecked, DoCheck {

  @Input() device: SelectItem;
  power: SelectItem[];

  constructor(private cdRef: ChangeDetectorRef) {}

  ngAfterViewChecked() {
    console.log('aaa');
  }

  ngDoCheck() {

  }

  ngOnInit() {
    this.cdRef.detectChanges();
    this.power = this.getPower();
  }

  private getPower(): SelectItem[] {
    return [
      { label: '-40', value: -40 },
      { label: '-20', value: -20 },
      { label: '-16', value: -16 },
      { label: '-12', value: -12 },
      { label: '-8', value: -8 },
      { label: '-4', value: -4 },
      { label: '0', value: 0 },
      { label: '3', value: 3 },
      { label: '4', value: 4 }
    ];
  }
}
