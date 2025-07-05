import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  ReservationFormData,
  ValidationResult,
  FormValidationErrors,
} from '../models';
import {
  REGIONS,
  BUSINESS_RULES,
  VALIDATION_PATTERNS,
  VALIDATION_MESSAGES,
  RESERVATION_DATES,
} from '../constants';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  constructor() {}

  validateReservationForm(
    formData: ReservationFormData
  ): Observable<ValidationResult> {
    return of(formData).pipe(
      delay(100),
      map((data) => {
        const errors: FormValidationErrors = {};

        this.validateDate(data.date, errors);
        this.validateTimeSlot(data.timeSlot, errors);
        this.validatePartySize(data.partySize, errors);
        this.validateRegion(data.regionId, errors);
        this.validateCustomerInfo(data, errors);
        this.validateBusinessRules(data, errors);

        return {
          isValid: Object.keys(errors).length === 0,
          errors,
        };
      })
    );
  }

  validateBusinessRules(
    formData: ReservationFormData,
    errors: FormValidationErrors
  ): void {
    const region = REGIONS.find((r) => r.id === formData.regionId);

    if (!region) {
      errors['regionId'] = ['Invalid region selected'];
      return;
    }

    if (formData.partySize > region.maxSize) {
      errors['partySize'] = [
        `Party size exceeds maximum for ${region.name} (${region.maxSize} guests)`,
      ];
    }

    if (formData.hasChildren && !region.childrenAllowed) {
      errors['hasChildren'] = [`Children are not allowed in ${region.name}`];
    }

    if (formData.needsSmoking && !region.smokingAllowed) {
      errors['needsSmoking'] = [`Smoking is not allowed in ${region.name}`];
    }
  }

  validateEmail(email: string): boolean {
    return VALIDATION_PATTERNS.EMAIL.test(email);
  }

  validatePhone(phone: string): boolean {
    return VALIDATION_PATTERNS.PHONE.test(phone);
  }

  validateName(name: string): boolean {
    return VALIDATION_PATTERNS.NAME.test(name) && name.trim().length >= 2;
  }

  private validateDate(date: string, errors: FormValidationErrors): void {
    if (!date) {
      errors['date'] = [VALIDATION_MESSAGES.REQUIRED];
      return;
    }

    if (!RESERVATION_DATES.includes(date)) {
      errors['date'] = [VALIDATION_MESSAGES.DATE_INVALID];
    }
  }

  private validateTimeSlot(
    timeSlot: string,
    errors: FormValidationErrors
  ): void {
    if (!timeSlot) {
      errors['timeSlot'] = [VALIDATION_MESSAGES.REQUIRED];
      return;
    }
  }

  private validatePartySize(
    partySize: number,
    errors: FormValidationErrors
  ): void {
    if (!partySize) {
      errors['partySize'] = [VALIDATION_MESSAGES.REQUIRED];
      return;
    }

    if (
      partySize < BUSINESS_RULES.MIN_PARTY_SIZE ||
      partySize > BUSINESS_RULES.MAX_PARTY_SIZE
    ) {
      errors['partySize'] = [VALIDATION_MESSAGES.PARTY_SIZE_INVALID];
    }
  }

  private validateRegion(regionId: string, errors: FormValidationErrors): void {
    if (!regionId) {
      errors['regionId'] = [VALIDATION_MESSAGES.REQUIRED];
      return;
    }

    const region = REGIONS.find((r) => r.id === regionId);
    if (!region) {
      errors['regionId'] = ['Invalid region selected'];
    }
  }

  private validateCustomerInfo(
    formData: ReservationFormData,
    errors: FormValidationErrors
  ): void {
    if (!formData.name?.trim()) {
      errors['name'] = [VALIDATION_MESSAGES.REQUIRED];
    } else if (!this.validateName(formData.name)) {
      errors['name'] = [VALIDATION_MESSAGES.NAME_INVALID];
    }

    if (!formData.email?.trim()) {
      errors['email'] = [VALIDATION_MESSAGES.REQUIRED];
    } else if (!this.validateEmail(formData.email)) {
      errors['email'] = [VALIDATION_MESSAGES.EMAIL_INVALID];
    }

    if (!formData.phone?.trim()) {
      errors['phone'] = [VALIDATION_MESSAGES.REQUIRED];
    } else if (!this.validatePhone(formData.phone)) {
      errors['phone'] = [VALIDATION_MESSAGES.PHONE_INVALID];
    }
  }
}
