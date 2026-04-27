import { describe, it, expect } from 'vitest'
import { StubEmailProvider } from '../../src/email/index.js'

describe('StubEmailProvider', () => {
  it('succeeds for a normal email address', async () => {
    const provider = new StubEmailProvider()
    const result = await provider.send({ replyTo: 'user@example.com' })
    expect(result.error).toBeUndefined()
  })

  it('succeeds when replyTo is absent', async () => {
    const provider = new StubEmailProvider()
    const result = await provider.send({ to: 'contact@example.com' })
    expect(result.error).toBeUndefined()
  })

  it('throws when username is throw', async () => {
    const provider = new StubEmailProvider()
    await expect(provider.send({ replyTo: 'throw@anything.com' }))
      .rejects.toThrow('Simulated send failure')
  })

  it('returns an error when username is error', async () => {
    const provider = new StubEmailProvider()
    const result = await provider.send({ replyTo: 'error@anything.com' })
    expect(result.error).toBeTruthy()
    expect(result.error.message).toBe('Simulated API error')
    expect(result.error.statusCode).toBe(422)
  })
})
