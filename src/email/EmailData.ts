export interface EmailData {
  to: string
  from: string
  replyTo?: string
  subject: string
  html?: string
  text?: string
}
