import { type NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { createSession } from '@/lib/auth'
import { findUserByLineId, saveUser } from '@/lib/auth/store'

const LINE_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/token'
const LINE_PROFILE_URL = 'https://api.line.me/v2/profile'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const cookieStore = await cookies()
  const storedState = cookieStore.get('line_oauth_state')?.value
  cookieStore.delete('line_oauth_state')

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url))
  }

  const clientId = process.env.LINE_CLIENT_ID!
  const clientSecret = process.env.LINE_CLIENT_SECRET!
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const callbackUrl = `${baseUrl}/api/auth/line/callback`

  try {
    // Exchange code for token
    const tokenRes = await fetch(LINE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: callbackUrl,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })
    if (!tokenRes.ok) throw new Error('Token exchange failed')
    const { access_token } = await tokenRes.json() as { access_token: string }

    // Fetch LINE profile
    const profileRes = await fetch(LINE_PROFILE_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    if (!profileRes.ok) throw new Error('Profile fetch failed')
    const profile = await profileRes.json() as { userId: string; displayName: string }

    // Find or create user
    let user = findUserByLineId(profile.userId)
    if (!user) {
      const id = randomBytes(8).toString('hex')
      user = {
        id,
        name: profile.displayName,
        email: `line_${profile.userId}@placeholder.invalid`,
        passwordHash: null,
        role: 'seeker',
        prefecture: '',
        qualifications: [],
        experienceYears: 0,
        employmentTypes: [],
        desiredSalaryMin: null,
        bio: '',
        provider: 'line',
        lineId: profile.userId,
        createdAt: new Date().toISOString(),
      }
      saveUser(user)
    }

    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: access_token,
    })
    return NextResponse.redirect(new URL('/profile', request.url))
  } catch {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url))
  }
}
