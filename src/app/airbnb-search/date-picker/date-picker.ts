import { Component, signal } from '@angular/core';

type TabType = 'dates' | 'months' | 'flexible';
type FlexibilityOption = 'exact' | '1day' | '2days' | '3days' | '7days' | '14days';

interface CalendarDay {
  date: number;
  disabled: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-date-picker',
  imports: [],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css'
})
export class DatePicker {

  activeTab = signal<TabType>('dates');
  selectedFlexibility = signal<FlexibilityOption>('exact');

  flexibilityOptions: { value: FlexibilityOption; label: string }[] = [
    { value: 'exact', label: 'Exact dates' },
    { value: '1day', label: '± 1 day' },
    { value: '2days', label: '± 2 days' },
    { value: '3days', label: '± 3 days' },
    { value: '7days', label: '± 7 days' },
    { value: '14days', label: '± 14 days' }
  ];

  monthNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  currentMonth = 'October 2025';
  nextMonth = 'November 2025';

  // Simplified calendar data for October 2025
  currentMonthDays: (CalendarDay | null)[] = [
    // First week (Sun-Sat)
    null, null, null, null, { date: 1, disabled: true, isToday: false },
    { date: 2, disabled: true, isToday: false }, { date: 3, disabled: true, isToday: false },
    // Week 2
    { date: 4, disabled: true, isToday: false }, { date: 5, disabled: true, isToday: false },
    { date: 6, disabled: false, isToday: false }, { date: 7, disabled: false, isToday: false },
    { date: 8, disabled: false, isToday: false }, { date: 9, disabled: false, isToday: false },
    { date: 10, disabled: false, isToday: false },
    // Week 3
    { date: 11, disabled: false, isToday: false }, { date: 12, disabled: false, isToday: false },
    { date: 13, disabled: false, isToday: false }, { date: 14, disabled: false, isToday: false },
    { date: 15, disabled: false, isToday: false }, { date: 16, disabled: false, isToday: false },
    { date: 17, disabled: false, isToday: false },
    // Week 4
    { date: 18, disabled: false, isToday: true }, { date: 19, disabled: false, isToday: false },
    { date: 20, disabled: false, isToday: false }, { date: 21, disabled: false, isToday: false },
    { date: 22, disabled: false, isToday: false }, { date: 23, disabled: false, isToday: false },
    { date: 24, disabled: false, isToday: false },
    // Week 5
    { date: 25, disabled: false, isToday: false }, { date: 26, disabled: false, isToday: false },
    { date: 27, disabled: false, isToday: false }, { date: 28, disabled: false, isToday: false },
    { date: 29, disabled: false, isToday: false }, { date: 30, disabled: false, isToday: false },
    { date: 31, disabled: false, isToday: false }
  ];

  // Simplified calendar data for November 2025
  nextMonthDays: (CalendarDay | null)[] = [
    // First week
    null, null, null, null, null, null, { date: 1, disabled: false, isToday: false },
    // Week 2
    { date: 2, disabled: false, isToday: false }, { date: 3, disabled: false, isToday: false },
    { date: 4, disabled: false, isToday: false }, { date: 5, disabled: false, isToday: false },
    { date: 6, disabled: false, isToday: false }, { date: 7, disabled: false, isToday: false },
    { date: 8, disabled: false, isToday: false },
    // Week 3
    { date: 9, disabled: false, isToday: false }, { date: 10, disabled: false, isToday: false },
    { date: 11, disabled: false, isToday: false }, { date: 12, disabled: false, isToday: false },
    { date: 13, disabled: false, isToday: false }, { date: 14, disabled: false, isToday: false },
    { date: 15, disabled: false, isToday: false },
    // Week 4
    { date: 16, disabled: false, isToday: false }, { date: 17, disabled: false, isToday: false },
    { date: 18, disabled: false, isToday: false }, { date: 19, disabled: false, isToday: false },
    { date: 20, disabled: false, isToday: false }, { date: 21, disabled: false, isToday: false },
    { date: 22, disabled: false, isToday: false },
    // Week 5
    { date: 23, disabled: false, isToday: false }, { date: 24, disabled: false, isToday: false },
    { date: 25, disabled: false, isToday: false }, { date: 26, disabled: false, isToday: false },
    { date: 27, disabled: false, isToday: false }, { date: 28, disabled: false, isToday: false },
    { date: 29, disabled: false, isToday: false },
    // Week 6
    { date: 30, disabled: false, isToday: false }
  ];

  setActiveTab(tab: TabType): void {
    this.activeTab.set(tab);
  }

  setFlexibility(option: FlexibilityOption): void {
    this.selectedFlexibility.set(option);
  }

  selectDate(day: CalendarDay | null): void {
    if (!day || day.disabled) return;
    console.log('Selected date:', day.date);
  }
}
