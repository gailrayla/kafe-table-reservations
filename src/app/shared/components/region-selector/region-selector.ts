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
import { Region, REGIONS, AvailabilityService } from '../../../core';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';

@Component({
  selector: 'app-region-selector',
  standalone: true,
  imports: [CommonModule, LoadingSpinner],
  template: `
    <div class="region-selector">
      <div class="region-selector__header">
        <h3>Select Your Dining Area</h3>
        <p class="region-selector__message">
          {{ getRegionAvailabilityMessage() }}
        </p>
      </div>

      <div class="region-selector__loading" *ngIf="loading">
        <app-loading-spinner
          size="small"
          message="Checking region availability..."
        ></app-loading-spinner>
      </div>

      <div
        class="region-selector__grid"
        *ngIf="!loading && availableRegions.length > 0"
      >
        <div
          *ngFor="let region of availableRegions; trackBy: trackByRegion"
          class="region-selector__region"
          [class.region-selector__region--selected]="
            selectedRegionId === region.id
          "
          [class.region-selector__region--unavailable]="
            isRegionBooked(region.id)
          "
          [class.region-selector__region--disabled]="disabled"
          (click)="onRegionSelect(region.id)"
        >
          <div class="region-selector__region-header">
            <h4 class="region-selector__region-name">{{ region.name }}</h4>
            <div class="region-selector__region-capacity">
              Up to {{ region.maxSize }} guests
            </div>
          </div>

          <div
            class="region-selector__region-constraints"
            *ngIf="getRegionConstraints(region).length > 0"
          >
            <span
              *ngFor="let constraint of getRegionConstraints(region)"
              class="region-selector__constraint-tag"
            >
              {{ constraint }}
            </span>
          </div>

          <div
            class="region-selector__region-status"
            *ngIf="isRegionBooked(region.id)"
          >
            <span class="region-selector__status-badge">Already Booked</span>
          </div>
        </div>
      </div>

      <div
        class="region-selector__empty"
        *ngIf="!loading && availableRegions.length === 0"
      >
        <p>No regions available for your current selection.</p>
        <p>Please try a different date, time, or adjust your requirements.</p>
      </div>

      <div
        class="region-selector__legend"
        *ngIf="!loading && availableRegions.length > 0"
      >
        <div class="region-selector__legend-item">
          <div
            class="region-selector__legend-color region-selector__legend-color--available"
          ></div>
          <span>Available</span>
        </div>
        <div class="region-selector__legend-item">
          <div
            class="region-selector__legend-color region-selector__legend-color--booked"
          ></div>
          <span>Already Booked</span>
        </div>
        <div class="region-selector__legend-item">
          <div
            class="region-selector__legend-color region-selector__legend-color--selected"
          ></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  `,
  styleUrl: './region-selector.scss',
})
export class RegionSelector implements OnInit, OnChanges {
  @Input() selectedDate: string | null = null;
  @Input() selectedTimeSlot: string | null = null;
  @Input() partySize: number = 1;
  @Input() hasChildren: boolean = false;
  @Input() needsSmoking: boolean = false;
  @Input() selectedRegionId: string | null = null;
  @Input() disabled: boolean = false;
  @Output() regionSelected = new EventEmitter<string>();

  availableRegions: Region[] = [];
  bookedRegions: string[] = [];
  loading = false;

  constructor(
    private availabilityService: AvailabilityService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAvailableRegions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['selectedDate'] ||
      changes['selectedTimeSlot'] ||
      changes['partySize'] ||
      changes['hasChildren'] ||
      changes['needsSmoking']
    ) {
      this.loadAvailableRegions();

      // Clear selected region if it becomes unavailable
      if (this.selectedRegionId) {
        const stillAvailable = this.availableRegions.some(
          (r) => r.id === this.selectedRegionId && !this.isRegionBooked(r.id)
        );
        if (!stillAvailable) {
          this.selectedRegionId = null;
        }
      }
    }
  }

  onRegionSelect(regionId: string): void {
    if (this.disabled || this.isRegionBooked(regionId)) {
      return;
    }

    const region = this.availableRegions.find((r) => r.id === regionId);
    if (!region) {
      return;
    }

    this.selectedRegionId = regionId;
    this.regionSelected.emit(regionId);
  }

  isRegionBooked(regionId: string): boolean {
    return this.bookedRegions.includes(regionId);
  }

  getRegionConstraints(region: Region): string[] {
    const constraints: string[] = [];

    if (!region.childrenAllowed) {
      constraints.push('No children');
    }

    if (region.smokingAllowed) {
      constraints.push('Smoking allowed');
    }

    return constraints;
  }

  getRegionAvailabilityMessage(): string {
    if (!this.selectedDate || !this.selectedTimeSlot) {
      return 'Select date and time to see available regions';
    }

    if (this.loading) {
      return 'Checking availability...';
    }

    if (this.availableRegions.length === 0) {
      return 'No regions available for your selection';
    }

    const availableCount = this.availableRegions.filter(
      (r) => !this.isRegionBooked(r.id)
    ).length;
    const bookedCount = this.bookedRegions.length;

    if (availableCount === 0) {
      return 'All regions are booked for this time slot';
    }

    return `${availableCount} region${availableCount > 1 ? 's' : ''} available${
      bookedCount > 0 ? `, ${bookedCount} already booked` : ''
    }`;
  }

  trackByRegion(index: number, region: Region): string {
    return region.id;
  }

  private loadAvailableRegions(): void {
    if (!this.selectedDate || !this.selectedTimeSlot) {
      this.availableRegions = [];
      this.bookedRegions = [];
      return;
    }

    this.loading = true;

    // Get available regions based on constraints
    this.availabilityService
      .getAvailableRegions(
        this.selectedDate,
        this.selectedTimeSlot,
        this.partySize,
        this.hasChildren,
        this.needsSmoking
      )
      .subscribe({
        next: (regions) => {
          this.availabilityService
            .getBookedRegions(this.selectedDate!, this.selectedTimeSlot!)
            .subscribe({
              next: (bookedRegions) => {
                this.ngZone.run(() => {
                  this.availableRegions = regions;
                  this.bookedRegions = bookedRegions;
                  this.loading = false;
                  this.cdr.detectChanges();
                });
              },
              error: (error) => {
                console.error('Error getting booked regions:', error);
                this.ngZone.run(() => {
                  this.availableRegions = regions;
                  this.bookedRegions = [];
                  this.loading = false;
                  this.cdr.detectChanges();
                });
              },
            });
        },
        error: (error) => {
          console.error('Error loading available regions:', error);
          this.ngZone.run(() => {
            this.availableRegions = [];
            this.bookedRegions = [];
            this.loading = false;
            this.cdr.detectChanges();
          });
        },
      });
  }
}
