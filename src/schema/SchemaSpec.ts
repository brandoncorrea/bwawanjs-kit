import { SchemaType } from "./SchemaType.ts"
import { ValidationRule } from "./ValidationRule.ts"

export interface SchemaSpec {
  type: SchemaType
  required?: boolean
  validations?: ValidationRule[]
  coerce?: (value: any) => any
}
