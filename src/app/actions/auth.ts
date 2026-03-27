'use server'

import { randomBytes } from 'crypto'
import { redirect } from 'next/navigation'
import { createSession, deleteSession, getSession } from '@/lib/auth'
import { findUserById, resetTokenStore, saveUser } from '@/lib/auth/store'
import { hashPassword } from '@/lib/auth/password'
import type { UserRole } from '@/lib/auth/store'

export type ActionResult = { error?: string; success?: string }

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:4000'

// Where each role lands after login
const ROLE_HOME: Record<UserRole, string> = {
  seeker: '/jobs',
  clinic: '/clinic/dashboard',
  admin:  '/admin',
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const email    = String(formData.get('email')    ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'メールアドレスとパスワードを入力してください。' }
  }

  let res: Response
  try {
    res = await fetch(`${BACKEND}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    })
  } catch {
    return { error: 'バックエンドサーバーに接続できません。サーバーが起動しているか確認してください。' }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const msg = body?.message ?? 'メールアドレスまたはパスワードが正しくありません。'
    return { error: Array.isArray(msg) ? msg.join(', ') : msg }
  }

  const data = await res.json() as {
    access_token: string
    user: { id: string; name: string; email: string; role: UserRole }
  }

  await createSession({
    id:    data.user.id,
    name:  data.user.name,
    email: data.user.email,
    role:  data.user.role,
    token: data.access_token,
  })

  redirect(ROLE_HOME[data.user.role])
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  await deleteSession()
  redirect('/login')
}

// ── Register (seeker only) ────────────────────────────────────────────────────

export async function registerAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name     = String(formData.get('name')     ?? '').trim()
  const email    = String(formData.get('email')    ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!name || !email || !password) return { error: '氏名・メールアドレス・パスワードは必須です。' }
  if (password.length < 8)          return { error: 'パスワードは8文字以上で入力してください。' }

  let res: Response
  try {
    res = await fetch(`${BACKEND}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: 'seeker' }),
      cache: 'no-store',
    })
  } catch {
    return { error: 'バックエンドサーバーに接続できません。サーバーが起動しているか確認してください。' }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const msg = body?.message ?? '登録に失敗しました。'
    if (res.status === 409) return { error: 'このメールアドレスはすでに登録されています。' }
    return { error: Array.isArray(msg) ? msg.join(', ') : msg }
  }

  const data = await res.json() as {
    access_token: string
    user: { id: string; name: string; email: string; role: UserRole }
  }

  await createSession({
    id:    data.user.id,
    name:  data.user.name,
    email: data.user.email,
    role:  data.user.role,
    token: data.access_token,
  })

  redirect('/jobs')
}

// ── Forgot password ───────────────────────────────────────────────────────────

const RESET_TTL_MS = 60 * 60 * 1000

export async function forgotPasswordAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { error: 'メールアドレスを入力してください。' }

  const user = findUserById(email) // graceful no-op if not in local store
  if (user) {
    const token = randomBytes(32).toString('hex')
    resetTokenStore.set(token, { userId: user.id, expiresAt: Date.now() + RESET_TTL_MS })
    console.log('[DEV] Password reset link: /reset-password?token=' + token)
  }

  return { success: 'パスワードリセットのメールを送信しました。メールボックスをご確認ください。' }
}

// ── Reset password ────────────────────────────────────────────────────────────

export async function resetPasswordAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const token    = String(formData.get('token')    ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const confirm  = String(formData.get('confirm')  ?? '')

  if (!token)               return { error: '無効なリセットリンクです。' }
  if (password.length < 8)  return { error: 'パスワードは8文字以上で入力してください。' }
  if (password !== confirm)  return { error: 'パスワードが一致しません。' }

  const record = resetTokenStore.get(token)
  if (!record || Date.now() > record.expiresAt) {
    return { error: 'リセットリンクの有効期限が切れています。再度お試しください。' }
  }

  const user = findUserById(record.userId)
  if (!user) return { error: '無効なリセットリンクです。' }

  saveUser({ ...user, passwordHash: hashPassword(password) })
  resetTokenStore.delete(token)

  const session = await getSession()
  if (session) redirect(ROLE_HOME[session.role])
  redirect('/login')
}
