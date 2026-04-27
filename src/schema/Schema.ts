import { SchemaSpec } from "./SchemaSpec"

export interface Schema {
  [field: string]: SchemaSpec
}
