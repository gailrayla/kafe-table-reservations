import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ReservationFormData, REGIONS, Region } from '../../../../core';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-reservation-summary',
  templateUrl: './reservation-summary.html',
  imports: [LoadingSpinner],
  styleUrls: ['./reservation-summary.scss'],
})
export class ReservationSummary implements OnInit {
  @Input() reservationData!: ReservationFormData;
  @Input() isSubmitting: boolean = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<void>();

  selectedRegion: Region | null = null;

  ngOnInit(): void {
    this.selectedRegion =
      REGIONS.find((r) => r.id === this.reservationData.regionId) || null;
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onEdit(): void {
    this.editRequested.emit();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }

  formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  getPartyDescription(): string {
    const size = this.reservationData.partySize;
    const guest = size === 1 ? 'guest' : 'guests';
    let description = `${size} ${guest}`;

    if (this.reservationData.hasChildren) {
      description += ' (including children)';
    }

    return description;
  }
}
