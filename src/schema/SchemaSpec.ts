import { SchemaType } from "./SchemaType"
import { ValidationRule } from "./ValidationRule"

export interface SchemaSpec {
  type: SchemaType
  required?: boolean
  validations?: ValidationRule[]
  coerce?: (value: any) => any
}
