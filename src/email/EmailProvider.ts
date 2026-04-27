import { EmailData } from "./EmailData";
import { EmailResult } from "./EmailResult";

export interface EmailProvider {
  send: (data: EmailData) => Promise<EmailResult>
}
