import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import MobileSelect from 'mobile-select';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-mobile-datetime-select',
  templateUrl: './mobile-datetime-select.html'
})
export class MobileDatetimeSelectComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() triggerId: string;
  @Input() triggerText: string;
  @Input() externalTrigger: boolean;
  @Input() selectedDate: Date;
  @Output() dateSelected: EventEmitter<Date> = new EventEmitter<Date>();
  private monthNames: string[] = [];
  private years: number[] = [];
  private ensureBtnText: string = 'Ok';
  private cancelBtnText: string = 'Cancel';

  private static convertToDoubleDigits(list: number[]): string[] {
    return list.map((value => {
      const valueString = value.toString();
      return valueString.length === 1 ? `0${valueString}` : valueString;
    }));
  }

  constructor(private translateService: TranslateService) {
  }

  ngOnInit(): void {
    const monthNames: string[] = ['month.january', 'month.february', 'month.march', 'month.april', 'month.may', 'month.june',
      'month.july', 'month.august', 'month.september', 'month.october', 'month.november', 'month.december'
    ];
    monthNames.forEach((toTranslate: string) => {
      this.translateService.get(toTranslate).subscribe((translated: string) => {
        this.monthNames.push(translated);
      });
    });
    this.translateService.get(this.ensureBtnText).subscribe((translated: string) => {
      this.ensureBtnText = translated;
    });
    this.translateService.get(this.cancelBtnText).subscribe((translated: string) => {
      this.cancelBtnText = translated;
    });
    this.translateService.get(this.triggerText).subscribe((translated: string) => {
      this.triggerText = translated;
    });
    this.years = this.makeRange(1989, new Date().getFullYear());
  }

  ngAfterViewInit(): void {
    const mobileSelect = new MobileSelect({
      trigger: `#${this.triggerId}`,
      wheels: [
        {
          data: this.makeRange(1, this.getDaysCountInMonth())
        },
        {
          data: this.monthNames
        },
        {
          data: this.years
        },
        {
          data: MobileDatetimeSelectComponent.convertToDoubleDigits(this.makeRange(0, 23))
        },
        {
          data: MobileDatetimeSelectComponent.convertToDoubleDigits(this.makeRange(0, 59))
        }
      ],
      ensureBtnText: this.ensureBtnText,
      cancelBtnText: this.cancelBtnText,
      triggerDisplayData: false,
      callback: (indexes, data) => {
        this.selectedDate = new Date(data[2], this.getMonthIndex(data[1]), data[0], data[3], data[4]);
        this.dateSelected.next(this.selectedDate);
      },
      transitionEnd: (indexes, data) => {
        const newDate = new Date(data[2], this.getMonthIndex(data[1]), 1);
        const daysCountInMonth: number = this.getDaysCountInMonth(newDate);
        if (daysCountInMonth < data[0]) {
          newDate.setDate(daysCountInMonth);
          mobileSelect.locatePosition(0, newDate.getDate() - 1);
        } else {
          newDate.setDate(data[0]);
        }
        if (this.hasMonthWheelChanged(indexes[1]) || this.hasYearWheelChanged(indexes[2])) {
          mobileSelect.updateWheel(0, this.makeRange(1, daysCountInMonth));
        }
        this.selectedDate = newDate;
      }
    });
    this.setSelectedDateOnWheels(mobileSelect);
  }

  ngOnDestroy(): void {
    document.querySelector('.mobileSelect').remove();
  }

  private makeRange(from, to): number[] {
    if (from === to) {
      return [from];
    }
    return [from, ...this.makeRange(from + 1, to)];
  }

  private getDaysCountInMonth(date: Date = this.selectedDate): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  private getMonthIndex(monthName: string): number {
    return this.monthNames.findIndex((value: string) => {
      return monthName === value;
    });
  }

  private getYearIndex(year: number): number {
    return this.years.findIndex((value: number) => year === value);
  }

  private hasMonthWheelChanged(currentWheelIndex: number): boolean {
    return this.selectedDate.getMonth() !== currentWheelIndex;
  }

  private hasYearWheelChanged(currentWheelIndex: number): boolean {
    return this.getYearIndex(this.selectedDate.getFullYear()) !== currentWheelIndex;
  }

  private setSelectedDateOnWheels(mobileSelect: MobileSelect): void {
    mobileSelect.locatePosition(0, this.selectedDate.getDate() - 1);
    mobileSelect.locatePosition(1, this.selectedDate.getMonth());
    mobileSelect.locatePosition(2, this.getYearIndex(this.selectedDate.getFullYear()));
    mobileSelect.locatePosition(3, this.selectedDate.getHours());
    mobileSelect.locatePosition(4, this.selectedDate.getMinutes());
  }

}
