import { SchemaSpec } from "./SchemaSpec.ts"

export interface Schema {
  [field: string]: SchemaSpec
}
