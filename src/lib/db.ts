import { Pool } from 'pg'

// Reuse a single connection pool across hot-reloads in dev (Next.js global caching pattern)
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined
}

function getPool(): Pool {
  if (globalThis.__pgPool) return globalThis.__pgPool

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const pool = new Pool({ connectionString })
  globalThis.__pgPool = pool
  return pool
}

// Proxy defers pool creation until first use, so the module can be imported
// during build without DATABASE_URL being set.
const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    return (getPool() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export default pool
