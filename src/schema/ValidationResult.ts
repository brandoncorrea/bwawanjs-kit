export interface ValidationData {
  [field: string]: any
}

export interface ValidationErrors {
  [field: string]: string
}

export interface ValidationResult {
  data: ValidationData,
  errors: ValidationErrors
}