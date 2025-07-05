import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AvailabilityService } from '../../../core';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [LoadingSpinner],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.scss',
})
export class DatePicker implements OnInit {
  @Input() selectedDate: string | null = null;
  @Input() disabled: boolean = false;
  @Output() dateSelected = new EventEmitter<string>();

  availableDates: string[] = [
    '2024-07-24',
    '2024-07-25',
    '2024-07-26',
    '2024-07-27',
    '2024-07-28',
    '2024-07-29',
    '2024-07-30',
    '2024-07-31',
  ];

  dateAvailability: { [key: string]: boolean } = {};
  loading = false;

  constructor(private availabilityService: AvailabilityService) {}

  ngOnInit(): void {
    this.checkDateAvailability();
  }

  onDateSelect(date: string): void {
    if (this.disabled || !this.dateAvailability[date]) {
      return;
    }

    this.selectedDate = date;
    this.dateSelected.emit(date);
  }

  formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }

  private checkDateAvailability(): void {
    this.loading = true;

    this.availableDates.forEach((date) => {
      this.availabilityService.getAvailableTimeSlots(date).subscribe({
        next: (timeSlots) => {
          this.dateAvailability[date] = timeSlots.some(
            (slot) => slot.available
          );
          this.loading = false;
        },
        error: (error) => {
          console.error('Error checking date availability:', error);
          this.dateAvailability[date] = false;
          this.loading = false;
        },
      });
    });
  }
}
