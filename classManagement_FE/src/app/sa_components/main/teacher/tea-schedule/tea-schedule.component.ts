import { Component } from '@angular/core';
import { CalendarEvent, CalendarModule, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import { setHours, setMinutes } from 'date-fns';
import { Subject } from 'rxjs';

import { ViewChild, TemplateRef } from '@angular/core';
import { isSameDay, isSameMonth } from 'date-fns';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import localeVi from '@angular/common/locales/vi';
import { ClassScheduleService } from '../../../../core/services/class-schedule/class-schedule.service';
registerLocaleData(localeVi);

@Component({
  selector: 'app-tea-schedule',
  standalone: true,
  imports: [CalendarModule, CommonModule, FormsModule, MatButtonToggleModule, MatButtonModule, MatIconModule],
  templateUrl: './tea-schedule.component.html',
  styleUrl: './tea-schedule.component.scss',
})
export class TeaScheduleComponent {
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any> | undefined;

  dayStartHour: number = 7;  
  dayEndHour: number = 20; 
  hourSegments: number = 2;  
  hourDuration: number = 120;

  locale: string = 'vi';

  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;

  weekendDays: number[] = [DAYS_OF_WEEK.SUNDAY, DAYS_OF_WEEK.SATURDAY];

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;

  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  refresh = new Subject<void>();

  activeDayIsOpen: boolean = false;

  constructor(private classScheduleService: ClassScheduleService) {}

  ngOnInit(): void {
    this.fetchAllSchedules();
  }

  private mapPeriodToTime(period: 'PERIOD_1' | 'PERIOD_2' | 'PERIOD_3' | 'PERIOD_4' | 'PERIOD_5' | 'PERIOD_6'): { startHour: number; endHour: number } {
    const periods = {
      PERIOD_1: { startHour: 7, endHour: 9 },
      PERIOD_2: { startHour: 9, endHour: 11 },
      PERIOD_3: { startHour: 13, endHour: 15 },
      PERIOD_4: { startHour: 15, endHour: 17 },
      PERIOD_5: { startHour: 17, endHour: 19 },
      PERIOD_6: { startHour: 19, endHour: 21 },
    };
  
    return periods[period] || { startHour: 0, endHour: 0 };
  }
  
  private fetchAllSchedules(): void {
    this.classScheduleService.getAllClass().subscribe((response) => {
      this.events = response.content.map((item: any) => {
        const { startHour, endHour } = this.mapPeriodToTime(item.periodInDay);
  
        const start = setMinutes(setHours(new Date(item.day), startHour), 0);
        const end = setMinutes(setHours(new Date(item.day), endHour), 0);
  
        return {
          title: item.className,
          start: start,
          end: end,
          color: { primary: '#1e90ff', secondary: '#D1E8FF' },
          allDay: false,
        };
      });
  
      this.refresh.next();
    });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  setView(view: CalendarView): void {
    this.view = view;
  }

  closeOpenMonthViewDay(): void {
    this.activeDayIsOpen = false;
  }
}