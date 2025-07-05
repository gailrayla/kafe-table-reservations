import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Region, AvailabilityService } from '../../../core';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';

@Component({
  selector: 'app-region-selector',
  imports: [LoadingSpinner],
  templateUrl: './region-selector.html',
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
  loading = false;

  constructor(private availabilityService: AvailabilityService) {}

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
      if (this.selectedRegionId && this.availableRegions.length > 0) {
        const stillAvailable = this.availableRegions.some(
          (r) => r.id === this.selectedRegionId
        );
        if (!stillAvailable) {
          this.selectedRegionId = null;
        }
      }
    }
  }

  onRegionSelect(regionId: string): void {
    if (this.disabled) {
      return;
    }

    const region = this.availableRegions.find((r) => r.id === regionId);
    if (!region) {
      return;
    }

    this.selectedRegionId = regionId;
    this.regionSelected.emit(regionId);
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

    return `${this.availableRegions.length} region${
      this.availableRegions.length > 1 ? 's' : ''
    } available`;
  }

  private loadAvailableRegions(): void {
    if (!this.selectedDate || !this.selectedTimeSlot) {
      this.availableRegions = [];
      return;
    }

    this.loading = true;
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
          this.availableRegions = regions;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading available regions:', error);
          this.availableRegions = [];
          this.loading = false;
        },
      });
  }
}
