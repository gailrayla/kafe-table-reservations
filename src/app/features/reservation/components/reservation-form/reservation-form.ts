import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import {
  ReservationService,
  AvailabilityService,
  ValidationService,
  ReservationFormData,
  ReservationRequest,
  ReservationResponse,
} from '../../../../core';
import { DatePicker } from '../../../../shared/components/date-picker/date-picker';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { RegionSelector } from '../../../../shared/components/region-selector/region-selector';
import { TimeSlotSelector } from '../../../../shared/components/time-slot-selector/time-slot-selector';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { ReservationSummary } from '../reservation-summary/reservation-summary';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormField,
    ReservationSummary,
    LoadingSpinner,
    RegionSelector,
    DatePicker,
    TimeSlotSelector,
  ],
  templateUrl: './reservation-form.html',
  styleUrls: ['./reservation-form.scss'],
})
export class ReservationForm implements OnInit, OnDestroy {
  @Output() reservationCreated = new EventEmitter<ReservationResponse>();
  @Output() formStepChanged = new EventEmitter<number>();

  reservationForm: FormGroup;
  currentStep = 1;
  totalSteps = 4;
  isSubmitting = false;
  showSummary = false;

  validationErrors: { [key: string]: string[] } = {};

  availabilityChecking = false;
  availabilityError: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private availabilityService: AvailabilityService,
    private validationService: ValidationService
  ) {
    this.reservationForm = this.createForm();
  }

  ngOnInit(): void {
    this.setupFormValidation();
    this.setupAvailabilityChecking();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      date: ['', [Validators.required]],
      timeSlot: ['', [Validators.required]],

      partySize: [
        1,
        [Validators.required, Validators.min(1), Validators.max(12)],
      ],
      hasChildren: [false],
      needsSmoking: [false],

      regionId: ['', [Validators.required]],

      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
    });
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      if (this.isCurrentStepValid()) {
        this.currentStep++;
        this.formStepChanged.emit(this.currentStep);
      }
    } else {
      if (this.isCurrentStepValid()) {
        this.showSummary = true;
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.formStepChanged.emit(this.currentStep);
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
      this.formStepChanged.emit(this.currentStep);
    }
  }

  // Form validation - MAKE PUBLIC
  isCurrentStepValid(): boolean {
    const requiredFields = this.getRequiredFieldsForStep(this.currentStep);

    for (const field of requiredFields) {
      const control = this.reservationForm.get(field);
      if (!control || control.invalid) {
        control?.markAsTouched();
        return false;
      }
    }

    return true;
  }

  private getRequiredFieldsForStep(step: number): string[] {
    switch (step) {
      case 1:
        return ['date', 'timeSlot'];
      case 2:
        return ['partySize'];
      case 3:
        return ['regionId'];
      case 4:
        return ['name', 'email', 'phone'];
      default:
        return [];
    }
  }

  onDateSelected(date: string): void {
    this.reservationForm.patchValue({ date });
    this.reservationForm.patchValue({ timeSlot: '' });
  }

  onTimeSlotSelected(timeSlot: string): void {
    this.reservationForm.patchValue({ timeSlot });
  }

  onRegionSelected(regionId: string): void {
    this.reservationForm.patchValue({ regionId });
  }

  onSubmit(): void {
    if (this.reservationForm.valid) {
      this.isSubmitting = true;

      const formData = this.reservationForm.value as ReservationFormData;
      const reservationRequest: ReservationRequest = {
        date: formData.date,
        timeSlot: formData.timeSlot,
        partySize: formData.partySize,
        regionId: formData.regionId,
        hasChildren: formData.hasChildren,
        needsSmoking: formData.needsSmoking,
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
      };

      this.reservationService
        .createReservation(reservationRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.reservationCreated.emit(response);
          },
          error: (error) => {
            console.error('Reservation creation failed:', error);
            this.isSubmitting = false;
          },
        });
    }
  }

  private setupFormValidation(): void {
    this.reservationForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.validateForm();
      });
  }

  private setupAvailabilityChecking(): void {
    this.reservationForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged((prev, curr) => {
          return (
            prev.date === curr.date &&
            prev.timeSlot === curr.timeSlot &&
            prev.regionId === curr.regionId &&
            prev.partySize === curr.partySize
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((formValue) => {
        if (
          formValue.date &&
          formValue.timeSlot &&
          formValue.regionId &&
          this.currentStep < 4
        ) {
          this.checkAvailability(formValue);
        }
      });
  }

  private validateForm(): void {
    const formData = this.reservationForm.value as ReservationFormData;

    this.validationService
      .validateReservationForm(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.validationErrors = result.errors;
        },
        error: (error) => {
          console.error('Form validation error:', error);
        },
      });
  }

  private checkAvailability(formValue: any): void {
    this.availabilityChecking = true;
    this.availabilityError = null;

    this.availabilityService
      .checkAvailability(
        formValue.date,
        formValue.timeSlot,
        formValue.regionId,
        formValue.partySize
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (availability) => {
          this.availabilityChecking = false;
          if (!availability.available) {
            this.availabilityError = 'This time slot is no longer available';
            this.showUnavailableAlert(availability);
          }
        },
        error: (error) => {
          this.availabilityChecking = false;
          this.availabilityError = 'Unable to check availability';
          console.error('Availability check failed:', error);
        },
      });
  }

  private showUnavailableAlert(availability: any): void {
    const message =
      `Sorry! Your selected time slot is no longer available.\n\n` +
      `Please go back to select a different:\n` +
      `• Date\n` +
      `• Time\n` +
      `• Region\n\n` +
      `Click OK to go back to time selection.`;

    if (confirm(message)) {
      this.currentStep = 1;
      this.formStepChanged.emit(this.currentStep);

      this.reservationForm.patchValue({
        timeSlot: '',
        regionId: '',
      });

      this.availabilityError = null;
    }
  }

  get formData(): ReservationFormData {
    return this.reservationForm.value as ReservationFormData;
  }

  get isFormValid(): boolean {
    return this.reservationForm.valid && !this.availabilityError;
  }

  getFieldErrors(fieldName: string): string[] {
    return this.validationErrors[fieldName] || [];
  }

  getStepLabel(step: number): string {
    switch (step) {
      case 1:
        return 'Date & Time';
      case 2:
        return 'Party Details';
      case 3:
        return 'Region';
      case 4:
        return 'Contact Info';
      default:
        return '';
    }
  }

  increasePartySize(): void {
    const currentSize = this.reservationForm.get('partySize')?.value || 1;
    if (currentSize < 12) {
      this.reservationForm.patchValue({ partySize: currentSize + 1 });
    }
  }

  decreasePartySize(): void {
    const currentSize = this.reservationForm.get('partySize')?.value || 1;
    if (currentSize > 1) {
      this.reservationForm.patchValue({ partySize: currentSize - 1 });
    }
  }
}
