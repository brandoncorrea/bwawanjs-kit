import { SpecValidator } from "./Validator.ts";

export interface ValidationRule {
  validate: SpecValidator,
  message: string
}
