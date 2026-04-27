import { EmailData } from "./EmailData.ts"
import { EmailProvider } from "./EmailProvider.ts"

export class MemoryEmailProvider implements EmailProvider {
  emails: EmailData[]

  constructor() {
    this.emails = []
  }

  async send(data: EmailData) {
    this.emails.push(data)
    return {}
  }

  getEmails() {
    return structuredClone(this.emails)
  }
}
