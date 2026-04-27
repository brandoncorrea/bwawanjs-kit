import { describe, it, expect } from 'vitest'
import { MemoryEmailProvider } from '../../src/email/MemoryEmailProvider.js'

describe('MemoryEmailProvider', () => {
  it('has no emails sent', () => {
    const provider = new MemoryEmailProvider()
    expect(provider.getEmails()).toHaveLength(0)
  })

  it('sends one email', async () => {
    const provider = new MemoryEmailProvider()
    const result = await provider.send({ to: 'me@test.invalid' })
    expect(result.error).toBeUndefined()
    const emails = provider.getEmails()
    expect(emails).toHaveLength(1)
    expect(emails[0]).toEqual({ to: 'me@test.invalid' })
  })

  it('sends two emails', async () => {
    const provider = new MemoryEmailProvider()
    await provider.send({ to: 'me@test.invalid' })
    await provider.send({ to: 'contact@test.invalid' })
    const emails = provider.getEmails()
    expect(emails).toHaveLength(2)
    expect(emails[0]).toEqual({ to: 'me@test.invalid' })
    expect(emails[1]).toEqual({ to: 'contact@test.invalid' })
  })

  it('cannot mutate sent emails', async () => {
    const provider = new MemoryEmailProvider()
    await provider.send({ to: 'me@test.invalid' })
    const emails = provider.getEmails()
    emails.push({})
    emails[0].to = 'contact@test.invalid'
    expect(provider.getEmails()).toEqual([{ to: 'me@test.invalid' }])
  })
})
