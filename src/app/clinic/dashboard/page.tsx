import type { Metadata } from 'next'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { formatDate } from '@/lib/utils/format'
import Badge, { getApplicationStatusVariant } from '@/components/ui/Badge'

export const metadata: Metadata = {
  title: 'ダッシュボード | クリニック',
}

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:4000'

interface ClinicStats {
  activeJobs: number
  totalViewCount: number
  thisMonthApplications: number
  inProgressApplications: number
  recentApplications: {
    id: string
    seekerName: string
    jobTitle: string
    status: string
    appliedAt: string
  }[]
  activeJobsList: {
    id: string
    title: string
    jobType: string
    isActive: boolean
    viewCount: number
    applicationCount: number
    postedAt: string
  }[]
}

async function fetchClinicStats(jwt: string): Promise<ClinicStats | null> {
  try {
    const res = await fetch(`${BACKEND}/api/v1/stats/clinic`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function ClinicDashboardPage() {
  const session = await getSession()
  const stats = session?.token ? await fetchClinicStats(session.token) : null

  const clinicName = session?.name ?? 'クリニック'

  const statsCards = [
    { label: '求人掲載中',      value: stats?.activeJobs ?? 0,            unit: '件', icon: '📋', color: 'text-cyan-600',    bg: 'bg-cyan-50' },
    { label: '今月の応募数',    value: stats?.thisMonthApplications ?? 0, unit: '件', icon: '📨', color: 'text-indigo-600',  bg: 'bg-indigo-50' },
    { label: '選考中の応募者数', value: stats?.inProgressApplications ?? 0, unit: '名', icon: '👤', color: 'text-amber-600',   bg: 'bg-amber-50' },
    { label: '今月の閲覧数',    value: stats?.totalViewCount ?? 0,         unit: 'PV', icon: '👁', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {clinicName}の採用状況
            {!stats && <span className="ml-2 text-amber-500">（バックエンド未接続）</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/jobs" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <span>🌐</span>採用ページを見る
          </Link>
          <Link href="/clinic/jobs/new" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 shadow-sm">
            <span>＋</span>新しい求人を作成
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center text-lg shrink-0`}>{card.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className={`text-2xl font-bold ${card.color} mt-0.5 leading-tight`}>
                {card.value.toLocaleString('ja-JP')}
                <span className="text-sm font-normal text-gray-500 ml-0.5">{card.unit}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent applicants */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">最近の応募者</h2>
            <Link href="/clinic/ats" className="text-xs font-medium text-cyan-600 hover:text-cyan-700 hover:underline">すべて見る →</Link>
          </div>
          {!stats || stats.recentApplications.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">応募者はまだいません</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.recentApplications.map((app) => (
                <div key={app.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
                    {app.seekerName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{app.seekerName}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{app.jobTitle}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={getApplicationStatusVariant(app.status)}>{app.status}</Badge>
                    <span className="text-xs text-gray-400">{formatDate(app.appliedAt)}</span>
                  </div>
                  <Link href="/clinic/ats" className="shrink-0 text-xs font-medium text-cyan-600 border border-cyan-200 hover:border-cyan-400 px-2.5 py-1 rounded-lg hover:bg-cyan-50">
                    確認する
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active jobs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">掲載中の求人</h2>
            <Link href="/clinic/jobs" className="text-xs font-medium text-cyan-600 hover:text-cyan-700 hover:underline">すべて管理 →</Link>
          </div>
          {!stats || stats.activeJobsList.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">掲載中の求人はありません</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.activeJobsList.map((job) => (
                <div key={job.id} className="px-5 py-3.5">
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${job.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {job.isActive ? '掲載中' : '停止中'}
                    </span>
                    <Badge variant="info">{job.jobType}</Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-1 mb-2">{job.title}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>👁 {job.viewCount.toLocaleString('ja-JP')}回</span>
                      <span>📨 {job.applicationCount}件</span>
                      <span>掲載日: {formatDate(job.postedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/jobs/${job.id}`} className="text-xs text-gray-500 hover:text-gray-700 hover:underline">表示</Link>
                      <span className="text-gray-300">|</span>
                      <Link href={`/clinic/jobs/${job.id}/edit`} className="text-xs text-cyan-600 hover:text-cyan-700 hover:underline">編集</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">クイックアクション</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/clinic/jobs/new" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 shadow-sm">
            <span>＋</span>新しい求人を作成
          </Link>
          <Link href="/jobs" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <span>🌐</span>採用ページを見る
          </Link>
          <Link href="/clinic/ats" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <span>👥</span>応募者を管理する
          </Link>
          <Link href="/clinic/messages" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <span>💬</span>メッセージを確認
          </Link>
        </div>
      </div>
    </div>
  )
}
