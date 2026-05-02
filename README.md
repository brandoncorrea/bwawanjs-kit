# @bwawan/kit

Shared utilities for validation, rate limiting, and email.

## Install

```sh
npm install @bwawan/kit
```

## Modules

### Schema Validation

Schema-based input validation with type coercion.

```ts
import { validateSchema, oneOf, maxLength } from '@bwawan/kit/schema'

const schema = {
  name: { type: 'string', required: true, validations: [maxLength(100)] },
  role: { type: 'string', validations: [oneOf(['admin', 'user'])] },
  age:  { type: 'number' },
  active: { type: 'boolean' },
}

const result = validateSchema(schema, { name: 'Alice', role: 'admin' })
// { data: { name: 'Alice', role: 'admin' }, errors: {} }

const invalid = validateSchema(schema, { name: '', role: 'superuser' })
// { data: {}, errors: { name: 'is required', role: 'must be one of: admin, user' } }
```

**Schema types:** `string`, `number`, `boolean` — values are automatically coerced and trimmed.

**Schema options:**

| Option        | Description                                      |
|---------------|--------------------------------------------------|
| `type`        | `'string'` \| `'number'` \| `'boolean'`          |
| `required`    | Fail if value is null/undefined or coerces empty  |
| `validations` | Array of `{ validate, message }` rules            |
| `coerce`      | Custom transform applied after type coercion      |

**Built-in rules:** `oneOf(values[])`, `maxLength(n)`

### Rate Limiter

Sliding-window rate limiter with automatic cleanup.

```js
import { RateLimiter } from '@bwawan/kit/rate-limiter'

const limiter = new RateLimiter({
  windowMs: 30 * 60 * 1000,   // 30 minutes (default)
  maxRequests: 5,              // per window (default)
  cleanupIntervalMs: 60 * 60 * 1000, // 1 hour (default)
}).start()

limiter.record('user-123')
limiter.isLimited('user-123') // false (until maxRequests reached)

limiter.stop() // clears timers and entries
```

### Email

Provider-based email abstraction with test doubles.

```ts
import { EmailProvider, EmailData, MemoryEmailProvider } from '@bwawan/kit/email'

const provider: EmailProvider = new MemoryEmailProvider()

await provider.send({
  to: 'alice@example.com',
  from: 'noreply@example.com',
  subject: 'Hello',
  html: '<p>Hi Alice</p>',
})
```

**Interfaces:**

- `EmailProvider` — `{ send(data: EmailData): Promise<EmailResult> }`
- `EmailData` — `{ to, from, subject, replyTo?, html?, text? }`
- `EmailResult` — `{ error?: { message, statusCode? } }`

**Test providers:**

- `MemoryEmailProvider` — stores sent emails in memory; retrieve with `getEmails()`
- `StubEmailProvider` — simulates errors based on `replyTo` username (`throw` or `error`)

## Development

```sh
npm test            # run tests
npm run test:watch  # watch mode
npm run test:coverage
npm run mutate      # mutation testing
```

### Release

1. Run tests: `npm run test`
2. Update version in `package.json`
3. Update `CHANGELOG.md`
4. Tag: `git tag vx.x.x`
5. Push: `git push && git push --tags`
6. Publish: `npm publish --access public`

## License

MIT
