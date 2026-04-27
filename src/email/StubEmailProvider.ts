import { EmailData } from "./EmailData.ts"
import { EmailProvider } from "./EmailProvider.ts"

export class StubEmailProvider implements EmailProvider {
  async send(data: EmailData) {
    const username = data.replyTo?.split('@')[0]
    if (username === 'throw')
      throw new Error('Simulated send failure')
    if (username === 'error')
      return { error: { message: 'Simulated API error', statusCode: 422 } }
    return {}
  }
}
