import { EmailData } from "./EmailData"
import { EmailProvider } from "./EmailProvider"

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
