import Link from 'next/link'
import Image from 'next/image'
import NavLinks from './NavLinks'
import { getSession } from '@/lib/auth'
import { findUserById } from '@/lib/auth/store'
import { logoutAction } from '@/app/actions/auth'

const navLinks = [
  { href: '/jobs', label: '求人を探す' },
  // { href: '/clinic/dashboard', label: 'クリニックの方' },
  { href: '/community', label: 'コミュニティ' },
]

export default async function Header() {
  const session = await getSession()
  const user = session ? findUserById(session.id) : null

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + optional back-to-dashboard */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/bluejobs-logo.png"
                alt="ブルージョブズ"
                width={160}
                height={44}
                priority
                className="h-9 w-auto object-contain"
              />
            </Link>
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-slate-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                管理ダッシュボード
              </Link>
            )}
            {user?.role === 'clinic' && (
              <Link
                href="/clinic/dashboard"
                className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-cyan-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                クリニックダッシュボード
              </Link>
            )}
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="メインナビゲーション">
            <NavLinks links={navLinks} />
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors"
                >
                  {user.name}
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                  >
                    ログアウト
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
                >
                  無料登録
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}

function MobileMenu() {
  return (
    <button
      type="button"
      className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-cyan-600 hover:bg-gray-100 transition-colors"
      aria-label="メニューを開く"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    </button>
  )
}
