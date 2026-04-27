import { SpecValidator } from "./Validator";

export interface ValidationRule {
  validate: SpecValidator,
  message: string
}
