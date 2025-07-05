import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeSlot, AvailabilityService } from '../../../core';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';

@Component({
  selector: 'app-time-slot-selector',
  standalone: true,
  imports: [CommonModule, LoadingSpinner],
  template: `
    <div class="time-slot-selector">
      <div class="time-slot-selector__header" *ngIf="selectedDate">
        <h3>Available Times for {{ formatDateForDisplay(selectedDate) }}</h3>
      </div>

      <div class="time-slot-selector__loading" *ngIf="loading">
        <app-loading-spinner
          size="small"
          message="Checking availability..."
        ></app-loading-spinner>
      </div>

      <div
        class="time-slot-selector__grid"
        *ngIf="!loading && timeSlots.length > 0"
      >
        <div
          *ngFor="let slot of timeSlots; trackBy: trackBySlot"
          class="time-slot-selector__slot"
          [class.time-slot-selector__slot--selected]="
            selectedTimeSlot === slot.time
          "
          [class.time-slot-selector__slot--unavailable]="!slot.available"
          [class.time-slot-selector__slot--disabled]="disabled"
          (click)="onTimeSlotSelect(slot.time)"
        >
          <div class="time-slot-selector__time">
            {{ formatTimeForDisplay(slot.time) }}
          </div>
          <div class="time-slot-selector__status" *ngIf="!slot.available">
            Fully Booked
          </div>
        </div>
      </div>

      <div
        class="time-slot-selector__empty"
        *ngIf="!loading && timeSlots.length === 0"
      >
        <p>No time slots available for the selected date.</p>
      </div>

      <div
        class="time-slot-selector__legend"
        *ngIf="!loading && timeSlots.length > 0"
      >
        <div class="time-slot-selector__legend-item">
          <div
            class="time-slot-selector__legend-color time-slot-selector__legend-color--available"
          ></div>
          <span>Available</span>
        </div>
        <div class="time-slot-selector__legend-item">
          <div
            class="time-slot-selector__legend-color time-slot-selector__legend-color--unavailable"
          ></div>
          <span>Fully Booked</span>
        </div>
        <div class="time-slot-selector__legend-item">
          <div
            class="time-slot-selector__legend-color time-slot-selector__legend-color--selected"
          ></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  `,
  styleUrl: './time-slot-selector.scss',
})
export class TimeSlotSelector implements OnInit, OnChanges {
  @Input() selectedDate: string | null = null;
  @Input() selectedTimeSlot: string | null = null;
  @Input() disabled: boolean = false;
  @Output() timeSlotSelected = new EventEmitter<string>();

  timeSlots: TimeSlot[] = [];
  loading = false;

  constructor(
    private availabilityService: AvailabilityService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

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

  trackBySlot(index: number, slot: TimeSlot): string {
    return slot.id;
  }

  private loadTimeSlots(): void {
    if (!this.selectedDate) return;

    this.loading = true;

    this.availabilityService
      .getAvailableTimeSlots(this.selectedDate)
      .subscribe({
        next: (slots) => {
          this.ngZone.run(() => {
            this.timeSlots = slots;
            this.loading = false;
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          console.error('Error loading time slots:', error);
          this.ngZone.run(() => {
            this.timeSlots = [];
            this.loading = false;
            this.cdr.detectChanges();
          });
        },
      });
  }
}
