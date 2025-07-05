import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-field" [class.form-field--error]="hasErrors">
      <label *ngIf="label" [for]="inputId" class="form-field__label">
        {{ label }}
        <span *ngIf="required" class="form-field__required">*</span>
      </label>

      <input
        [id]="inputId"
        [type]="type"
        [placeholder]="placeholder"
        [value]="value"
        [disabled]="isDisabled"
        (input)="onInputChange($event)"
        (blur)="onInputBlur()"
        class="form-field__input"
        [class.form-field__input--error]="hasErrors"
      />

      <div *ngIf="hasErrors" class="form-field__errors">
        <span
          *ngFor="let error of errors; trackBy: trackByError"
          class="form-field__error"
        >
          {{ error }}
        </span>
      </div>

      <div *ngIf="hint && !hasErrors" class="form-field__hint">
        {{ hint }}
      </div>
    </div>
  `,
  styleUrl: './form-field.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormField),
      multi: true,
    },
  ],
})
export class FormField implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() errors: string[] = [];
  @Input() hint: string = '';
  @Input() fieldId: string = '';

  value: string = '';
  isDisabled: boolean = false;

  private _generatedId: string;

  private onChange = (value: string) => {};
  private onTouched = () => {};

  constructor() {
    this._generatedId = `form-field-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }

  onInputBlur(): void {
    this.onTouched();
  }

  get hasErrors(): boolean {
    return this.errors && this.errors.length > 0;
  }

  get inputId(): string {
    return this.fieldId || this._generatedId;
  }

  trackByError(index: number, error: string): string {
    return `${index}-${error}`;
  }
}
