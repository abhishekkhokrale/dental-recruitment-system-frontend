import type { Metadata } from 'next'
import Link from 'next/link'
import { getSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'ダッシュボード | 管理者画面',
}

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:4000'

interface AdminStats {
  totalUsers: number
  newUsersThisMonth: number
  activeJobs: number
  totalClinics: number
  thisMonthApplications: number
  newClinicsThisMonth: number
}

async function fetchAdminStats(jwt: string): Promise<AdminStats | null> {
  try {
    const res = await fetch(`${BACKEND}/api/v1/stats/admin`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

const barChartData = [
  { label: '10月', value: 210 },
  { label: '11月', value: 248 },
  { label: '12月', value: 195 },
  { label: '1月',  value: 312 },
  { label: '2月',  value: 287 },
  { label: '3月',  value: 399 },
]
const maxBarValue = Math.max(...barChartData.map((d) => d.value))

const recentActivity = [
  { id: '1', type: '新規登録', description: '歯科衛生士・田中さくらさんが登録しました',          time: '3分前',   badge: 'bg-emerald-100 text-emerald-700' },
  { id: '2', type: '求人掲載', description: 'スマイル歯科クリニックが新しい求人を投稿しました',  time: '15分前',  badge: 'bg-amber-100 text-amber-700' },
  { id: '3', type: '応募',     description: '歯科医師・佐藤けんじさんがホワイト歯科に応募',     time: '28分前',  badge: 'bg-blue-100 text-blue-700' },
  { id: '4', type: '新規登録', description: 'さくら歯科医院（大阪府）がクリニック登録を完了',   time: '41分前',  badge: 'bg-emerald-100 text-emerald-700' },
  { id: '5', type: '報告',     description: 'コミュニティ投稿がスパムとして報告されました',      time: '1時間前', badge: 'bg-rose-100 text-rose-700' },
]

export default async function AdminDashboardPage() {
  const session = await getSession()
  const stats = session?.token ? await fetchAdminStats(session.token) : null

  const statsCards = [
    { label: '総会員数',       value: stats ? stats.totalUsers.toLocaleString('ja-JP')            : '—', change: `+${stats?.newUsersThisMonth ?? 0}`,   changeLabel: '今月の新規',  positive: true,  icon: '👥', color: 'bg-blue-50 text-blue-600' },
    { label: '新規登録（今月）', value: stats ? stats.newUsersThisMonth.toLocaleString('ja-JP')   : '—', change: '今月',                                  changeLabel: '新規ユーザー', positive: true,  icon: '✨', color: 'bg-emerald-50 text-emerald-600' },
    { label: '掲載求人数',     value: stats ? stats.activeJobs.toLocaleString('ja-JP')            : '—', change: '掲載中',                                changeLabel: 'アクティブ求人', positive: true, icon: '📋', color: 'bg-cyan-50 text-cyan-600' },
    { label: '今月の応募数',   value: stats ? stats.thisMonthApplications.toLocaleString('ja-JP') : '—', change: '今月',                                  changeLabel: '応募件数',    positive: true,  icon: '📨', color: 'bg-purple-50 text-purple-600' },
    { label: 'クリニック数',   value: stats ? stats.totalClinics.toLocaleString('ja-JP')          : '—', change: `+${stats?.newClinicsThisMonth ?? 0}`,   changeLabel: '今月',       positive: true,  icon: '🏥', color: 'bg-orange-50 text-orange-600' },
    { label: '月間PV',         value: '—',                                                               change: '—',                                     changeLabel: '先月比',     positive: true,  icon: '📈', color: 'bg-rose-50 text-rose-600' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })} 現在
          {!stats && <span className="ml-2 text-amber-600">（バックエンド未接続 — ダミーデータ表示中）</span>}
        </p>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">要対応：承認待ちの求人</p>
            <p className="text-sm text-amber-700"><span className="font-bold">7件</span>の求人が審査待ちです。</p>
            <Link href="#" className="text-xs text-amber-600 underline hover:no-underline mt-0.5 inline-block">確認する →</Link>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 0 1 1.743-1.342 48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664 19.5 19.5" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-rose-800">要対応：報告されたコンテンツ</p>
            <p className="text-sm text-rose-700"><span className="font-bold">3件</span>のコンテンツが報告されています。</p>
            <Link href="#" className="text-xs text-rose-600 underline hover:no-underline mt-0.5 inline-block">確認する →</Link>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statsCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-2xl w-10 h-10 flex items-center justify-center rounded-xl ${card.color}`}>{card.icon}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {card.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.changeLabel}</p>
          </div>
        ))}
      </div>

      {/* Charts + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-1">月別新規登録数</h2>
          <p className="text-xs text-gray-400 mb-6">過去6ヶ月間の推移</p>
          <div className="flex items-end gap-3 h-40">
            {barChartData.map((d) => {
              const heightPct = Math.round((d.value / maxBarValue) * 100)
              return (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-gray-600">{d.value}</span>
                  <div className="w-full rounded-t-md bg-cyan-500" style={{ height: `${heightPct}%` }} />
                  <span className="text-xs text-gray-400">{d.label}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">今月のサマリー</h2>
          <div className="space-y-4">
            {[
              { label: '求職者登録率',   value: 68, color: 'bg-cyan-500' },
              { label: 'クリニック登録率', value: 42, color: 'bg-indigo-500' },
              { label: '求人マッチング率', value: 55, color: 'bg-emerald-500' },
              { label: '面接設定率',     value: 31, color: 'bg-amber-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{item.label}</span>
                  <span className="font-semibold">{item.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">最近のアクティビティ</h2>
          <button type="button" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">すべて見る</button>
        </div>
        <ul className="divide-y divide-gray-50">
          {recentActivity.map((a) => (
            <li key={a.id} className="px-6 py-3.5 flex items-start gap-3 hover:bg-gray-50">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 mt-0.5 ${a.badge}`}>{a.type}</span>
              <p className="text-sm text-gray-700 flex-1 leading-snug">{a.description}</p>
              <time className="text-xs text-gray-400 shrink-0">{a.time}</time>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
