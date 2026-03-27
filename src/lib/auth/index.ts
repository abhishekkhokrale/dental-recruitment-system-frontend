import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import type { StoredUser } from './store'

const SESSION_COOKIE = 'bj_session'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const SESSION_SECRET = process.env.SESSION_SECRET ?? 'bluejobs-dev-secret-do-not-use-in-prod'

// ── Session payload ───────────────────────────────────────────────────────────

interface SessionPayload {
  id: string
  name: string
  email: string
  role: 'seeker' | 'clinic' | 'admin'
  token: string   // backend JWT
  expiresAt: number
}

function sign(data: string): string {
  return createHmac('sha256', SESSION_SECRET).update(data).digest('hex')
}

// ── Session management ────────────────────────────────────────────────────────

export async function createSession(payload: Omit<SessionPayload, 'expiresAt'>): Promise<void> {
  const full: SessionPayload = { ...payload, expiresAt: Date.now() + SESSION_TTL_MS }
  const encoded = Buffer.from(JSON.stringify(full)).toString('base64url')
  const sig = sign(encoded)
  const token = `${encoded}.${sig}`

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(SESSION_COOKIE)?.value
  if (!raw) return null

  const dotIdx = raw.lastIndexOf('.')
  if (dotIdx === -1) return null

  const encoded = raw.substring(0, dotIdx)
  const sig = raw.substring(dotIdx + 1)

  const expectedSig = sign(encoded)
  if (sig.length !== expectedSig.length) return null
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null

  let payload: SessionPayload
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString())
  } catch {
    return null
  }

  if (!payload.id || !payload.expiresAt || Date.now() > payload.expiresAt) return null
  return payload
}

/** Returns a StoredUser-compatible object built from the session cookie (no extra API call). */
export async function getSessionUser(): Promise<StoredUser | null> {
  const session = await getSession()
  if (!session) return null

  return {
    id: session.id,
    name: session.name,
    email: session.email,
    role: session.role,
    passwordHash: '',          // not needed on frontend
    provider: 'email',
    lineId: null,
    prefecture: '',
    qualifications: [],
    experienceYears: 0,
    employmentTypes: [],
    desiredSalaryMin: null,
    bio: '',
    createdAt: '',
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
