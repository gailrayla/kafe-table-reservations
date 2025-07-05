import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';
import { AvailabilityService } from '../../../core';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, LoadingSpinner],
  template: `
    <div class="date-picker">
      <div class="date-picker__loading" *ngIf="loading">
        <app-loading-spinner size="small"></app-loading-spinner>
      </div>

      <div class="date-picker__grid" *ngIf="!loading">
        <div
          *ngFor="let date of availableDates; trackBy: trackByDate"
          class="date-picker__date"
          [class.date-picker__date--selected]="selectedDate === date"
          [class.date-picker__date--unavailable]="!dateAvailability[date]"
          [class.date-picker__date--disabled]="disabled"
          (click)="onDateSelect(date)"
        >
          <div class="date-picker__date-display">
            {{ formatDateForDisplay(date) }}
          </div>
          <div
            class="date-picker__availability"
            *ngIf="!dateAvailability[date]"
          >
            Fully Booked
          </div>
        </div>
      </div>

      <div class="date-picker__legend" *ngIf="!loading">
        <div class="date-picker__legend-item">
          <div
            class="date-picker__legend-color date-picker__legend-color--available"
          ></div>
          <span>Available</span>
        </div>
        <div class="date-picker__legend-item">
          <div
            class="date-picker__legend-color date-picker__legend-color--unavailable"
          ></div>
          <span>Fully Booked</span>
        </div>
        <div class="date-picker__legend-item">
          <div
            class="date-picker__legend-color date-picker__legend-color--selected"
          ></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  `,
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

  constructor(
    private availabilityService: AvailabilityService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDateAvailability();
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

  trackByDate(index: number, date: string): string {
    return date;
  }

  private loadDateAvailability(): void {
    this.loading = true;

    this.availabilityService
      .getMultipleDateAvailability(this.availableDates)
      .subscribe({
        next: (availability) => {
          this.ngZone.run(() => {
            this.dateAvailability = availability;
            this.loading = false;
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          console.error('Error loading date availability:', error);
          this.ngZone.run(() => {
            this.availableDates.forEach((date) => {
              this.dateAvailability[date] = true;
            });
            this.loading = false;
            this.cdr.detectChanges();
          });
        },
      });
  }
}
