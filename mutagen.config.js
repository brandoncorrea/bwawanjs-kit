import { mutators, createVitestRunner } from '@bwawan/mutagen'

const optionalChainingFix = {
  name: '?. → .',
  types: ['OptionalMemberExpression', 'OptionalCallExpression'],
  test: node => node.optional === true,
  mutate: ({ object, callee, start }, source) => {
    const searchFrom = object?.end ?? callee?.end ?? start
    const idx = source.indexOf('?.', searchFrom)
    if (idx === -1) return null
    return { start: idx, end: idx + 2, replacement: '.' }
  }
}

export default {
  mutators: [...mutators.javascript, optionalChainingFix],
  include: ['src/**/*.{js,ts}'],
  testInclude: ['tests/**/*.test.{js,ts}'],
  createRunner: (sourceFile, opts = {}) => createVitestRunner(sourceFile, {
    config: 'vitest.config.js',
    ...opts
  }),
  timeout: 15000,
  reportDir: 'reports/mutation'
}
