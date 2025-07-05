export interface FormValidationErrors {
  [key: string]: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormValidationErrors;
}
