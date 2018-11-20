import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-device-imu',
  templateUrl: './device-imu.html'
})
export class DeviceImuComponent implements OnInit {

  imuConfigForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createRfForm();
  }

  private createRfForm(): void {
    this.imuConfigForm = this.fb.group({
      imuData: this.fb.group({
        toggleImu: false
      })
    });
  }
}
