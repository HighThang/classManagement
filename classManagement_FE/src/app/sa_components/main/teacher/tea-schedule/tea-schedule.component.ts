import { Component } from '@angular/core';
import { CalendarEvent, CalendarModule, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import { addDays, startOfWeek, setHours, setMinutes } from 'date-fns';
import { Subject } from 'rxjs';

import { ViewChild, TemplateRef } from '@angular/core';
import { isSameDay, isSameMonth } from 'date-fns';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { DashboardService } from '../../../../core/services/dashboard/dashboard.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import localeVi from '@angular/common/locales/vi';
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

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    console.log(this.view)
    this.fetchWeeklySchedule();
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
  
  // Lấy lịch tuần từ API
  private fetchWeeklySchedule(): void {
    this.dashboardService.getClassInWeek().subscribe((response) => {
      const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Bắt đầu tuần là Thứ Hai

      this.events = response.content.flatMap((item: any) => {
        const { startHour, endHour } = this.mapPeriodToTime(item.classPeriod);

        // Duyệt qua các ngày trong tuần
        return [
          { dayKey: 'mondayClass', dayOffset: 0 },
          { dayKey: 'tuesdayClass', dayOffset: 1 },
          { dayKey: 'wednesdayClass', dayOffset: 2 },
          { dayKey: 'thursdayClass', dayOffset: 3 },
          { dayKey: 'fridayClass', dayOffset: 4 },
          { dayKey: 'saturdayClass', dayOffset: 5 },
          { dayKey: 'sundayClass', dayOffset: 6 },
        ]
          .filter(({ dayKey }) => item[dayKey] !== null) // Lọc ra các ngày có lớp học
          .map(({ dayKey, dayOffset }) => {
            const start = addDays(startOfCurrentWeek, dayOffset);
            return {
              title: item[dayKey], // Tên lớp học
              start: setMinutes(setHours(start, startHour), 0),
              end: setMinutes(setHours(start, endHour), 0),
              color: { primary: '#1e90ff', secondary: '#D1E8FF' },
              allDay: false,
            };
          });
      });
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





















// export class TeaScheduleComponent implements OnInit {
//   @Input() username!: string;

//   tableClassInWeekConfig: any = null;
//   userRole: string | null = null;
//   statistic: any = null;

//   constructor(
//     private dashboardService: DashboardService,
//     private userService: UserService
//   ) {}

//   ngOnInit(): void {
//     this.getUserInfo();
//     this.getClassInWeek();
//   }

//   getClassInWeek(): void {
//     this.dashboardService.getClassInWeek().subscribe(
//       (response) => {
//         const data = {
//           recordsTotal: response.totalElements,
//           recordsFiltered: response.totalElements,
//           data: response.content,
//         };
//         console.log(data)
//       },
//       (error) => {
//         console.error(error);
//       }
//     );
//   }

//   getUserInfo(): void {
//     this.userService.getUserInfo().subscribe(
//       (response) => {
//         this.userRole = response.role;
//         if (this.userRole === 'TEACHER') {
//           this.getDashboardData();
//         }
//       },
//       (error) => {
//         console.error(error);
//         alert(error);
//       }
//     );
//   }

//   getDashboardData(): void {
//     this.dashboardService.getDashboardData().subscribe(
//       (response) => {
//         this.statistic = response;
//       },
//       (error) => {
//         console.error(error);
//       }
//     );
//   }
// }
