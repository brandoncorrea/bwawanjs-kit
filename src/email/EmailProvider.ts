import { EmailData } from "./EmailData.ts"
import { EmailResult } from "./EmailResult.ts"

export interface EmailProvider {
  send: (data: EmailData) => Promise<EmailResult>
}
