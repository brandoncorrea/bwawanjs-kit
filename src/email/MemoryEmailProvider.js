export class MemoryEmailProvider {
  constructor() {
    this.emails = []
  }

  async send(data) {
    this.emails.push(data)
    return {}
  }

  getEmails() {
    return structuredClone(this.emails)
  }
}
