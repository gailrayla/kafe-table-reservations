import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TimeSlot, AvailabilityService } from '../../../core';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';

@Component({
  selector: 'app-time-slot-selector',
  imports: [LoadingSpinner],
  templateUrl: './time-slot-selector.html',
  styleUrl: './time-slot-selector.scss',
})
export class TimeSlotSelector implements OnInit, OnChanges {
  @Input() selectedDate: string | null = null;
  @Input() selectedTimeSlot: string | null = null;
  @Input() disabled: boolean = false;
  @Output() timeSlotSelected = new EventEmitter<string>();

  timeSlots: TimeSlot[] = [];
  loading = false;

  constructor(private availabilityService: AvailabilityService) {}

  ngOnInit(): void {
    if (this.selectedDate) {
      this.loadTimeSlots();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDate'] && this.selectedDate) {
      this.loadTimeSlots();
      // Clear selected time slot when date changes
      if (
        changes['selectedDate'].previousValue !==
        changes['selectedDate'].currentValue
      ) {
        this.selectedTimeSlot = null;
      }
    }
  }

  onTimeSlotSelect(timeSlot: string): void {
    if (this.disabled) {
      return;
    }

    const slot = this.timeSlots.find((s) => s.time === timeSlot);
    if (!slot?.available) {
      return;
    }

    this.selectedTimeSlot = timeSlot;
    this.timeSlotSelected.emit(timeSlot);
  }

  formatTimeForDisplay(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }

  private loadTimeSlots(): void {
    if (!this.selectedDate) return;

    this.loading = true;
    this.availabilityService
      .getAvailableTimeSlots(this.selectedDate)
      .subscribe({
        next: (slots) => {
          this.timeSlots = slots;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading time slots:', error);
          this.loading = false;
          this.timeSlots = [];
        },
      });
  }
}
