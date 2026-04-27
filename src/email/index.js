/**
 * @typedef {Object} EmailError
 * @property {string} message
 * @property {number} [statusCode]
 */

/**
 * @typedef {Object} EmailResult
 * @property {EmailError} [error]
 */

/**
 * @typedef {Object} EmailData
 * @property {string} to
 * @property {string} [from]
 * @property {string} [replyTo]
 * @property {string} [subject]
 * @property {string} [html]
 * @property {string} [text]
 */

/**
 * @typedef {Object} EmailProvider
 * @property {(data: EmailData) => Promise<EmailResult>} send
 */

export { MemoryEmailProvider } from './MemoryEmailProvider.js'
export { StubEmailProvider } from './StubEmailProvider.js'
