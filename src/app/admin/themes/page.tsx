'use client'

import { useEffect, useId, useState } from 'react'
import type { LPTheme } from '@/components/clinic/LandingPageRenderer'
import { saveTheme, loadAllThemes, deleteTheme, buildTheme } from '@/lib/themeStorage'
// ── Form state ────────────────────────────────────────────────────────────────
interface ThemeForm {
  nameJa:       string
  accent:       string
  topbarBg:     string
  headerBg:     string
  footerBg:     string
  cardBg:       string
  sectionAltBg: string
}

const DEFAULT_FORM: ThemeForm = {
  nameJa:       '',
  accent:       '#0891b2',
  topbarBg:     '#0891b2',
  headerBg:     '#ffffff',
  footerBg:     '#0f172a',
  cardBg:       '#f0f9ff',
  sectionAltBg: '#f8fafc',
}

function randomId() {
  return 'custom_' + Math.random().toString(36).slice(2, 9)
}

// ── Colour swatch strip ───────────────────────────────────────────────────────
function ThemeStrip({ theme }: { theme: LPTheme }) {
  return (
    <div className="flex h-8 rounded-lg overflow-hidden">
      <div className="flex-1" style={{ background: theme.topbarBg }} title="トップバー" />
      <div className="flex-1" style={{ background: theme.headerBg }} title="ヘッダー" />
      <div className="flex-1" style={{ background: theme.accent }} title="アクセント" />
      <div className="flex-1" style={{ background: theme.sectionAltBg }} title="セクション背景" />
      <div className="flex-1" style={{ background: theme.cardBg }} title="カード背景" />
      <div className="flex-1" style={{ background: theme.footerBg }} title="フッター" />
    </div>
  )
}

// ── Colour picker field ───────────────────────────────────────────────────────
function ColorField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId()
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="text-sm text-gray-600 w-36 shrink-0">{label}</label>
      <div className="flex items-center gap-2 flex-1">
        <input
          id={id}
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={e => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && onChange(e.target.value)}
          className="flex-1 text-sm font-mono border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
          maxLength={7}
        />
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminThemesPage() {
  const [allThemes, setAllThemes] = useState<Record<string, LPTheme>>({})
  const [loading, setLoading] = useState(true)

  // modal
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ThemeForm>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)

  // delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    loadAllThemes()
      .then(setAllThemes)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(DEFAULT_FORM)
    setShowModal(true)
  }

  function openEdit(id: string, theme: LPTheme) {
    setEditingId(id)
    setForm({
      nameJa:       theme.nameJa,
      accent:       theme.accent,
      topbarBg:     theme.topbarBg,
      headerBg:     theme.headerBg,
      footerBg:     theme.footerBg,
      cardBg:       theme.cardBg,
      sectionAltBg: theme.sectionAltBg,
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.nameJa.trim()) return
    setSaving(true)
    const id    = editingId ?? randomId()
    const theme = buildTheme(form.nameJa, form.accent, form.topbarBg, form.headerBg, form.footerBg, form.cardBg, form.sectionAltBg)
    await saveTheme(id, theme)
    setAllThemes(prev => ({ ...prev, [id]: theme }))
    setShowModal(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await deleteTheme(id)
    setAllThemes(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setDeleteId(null)
  }

  // live preview of the form
  const preview = buildTheme(form.nameJa || 'プレビュー', form.accent, form.topbarBg, form.headerBg, form.footerBg, form.cardBg, form.sectionAltBg)

  return (
    <div className="p-6 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">ランディングページ テーマ管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">作成したテーマはクリニックのテーマ選択画面に表示されます</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新しいテーマを作成
        </button>
      </div>

      {/* All themes */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">テーマ一覧 ({Object.keys(allThemes).length}件)</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-6">
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            読み込み中…
          </div>
        ) : Object.keys(allThemes).length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl py-12 text-center">
            <p className="text-gray-400 text-sm">まだテーマがありません</p>
            <button onClick={openCreate} className="mt-3 text-sm text-orange-600 font-semibold hover:underline">
              最初のテーマを作成する →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(allThemes).map(([id, theme]) => (
              <div key={id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <ThemeStrip theme={theme} />
                <div className="p-4">
                  <p className="font-bold text-gray-900">{theme.nameJa}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">{theme.accent}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => openEdit(id, theme)}
                      className="flex-1 text-xs font-semibold py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => setDeleteId(id)}
                      className="flex-1 text-xs font-semibold py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-base font-bold text-gray-900">
                {editingId ? 'テーマを編集' : '新しいテーマを作成'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: form */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">テーマ名 *</label>
                  <input
                    type="text"
                    value={form.nameJa}
                    onChange={e => setForm(p => ({ ...p, nameJa: e.target.value }))}
                    placeholder="例：スカイブルー"
                    className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                {/* Color pickers */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">カラー設定</p>
                  <ColorField label="アクセント"        value={form.accent}       onChange={v => setForm(p => ({ ...p, accent: v }))} />
                  <ColorField label="トップバー背景"    value={form.topbarBg}     onChange={v => setForm(p => ({ ...p, topbarBg: v }))} />
                  <ColorField label="ヘッダー背景"      value={form.headerBg}     onChange={v => setForm(p => ({ ...p, headerBg: v }))} />
                  <ColorField label="フッター背景"      value={form.footerBg}     onChange={v => setForm(p => ({ ...p, footerBg: v }))} />
                  <ColorField label="カード背景"        value={form.cardBg}       onChange={v => setForm(p => ({ ...p, cardBg: v }))} />
                  <ColorField label="セクション背景"    value={form.sectionAltBg} onChange={v => setForm(p => ({ ...p, sectionAltBg: v }))} />
                </div>
              </div>

              {/* Right: live preview */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">プレビュー</p>
                {/* Mini theme card preview */}
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  {/* Topbar */}
                  <div className="h-6 px-3 flex items-center text-xs font-bold" style={{ background: preview.topbarBg, color: preview.topbarText }}>
                    スマイル歯科クリニック
                  </div>
                  {/* Header */}
                  <div className="h-10 px-3 flex items-center justify-between" style={{ background: preview.headerBg, borderBottom: `1px solid ${preview.headerBorder}` }}>
                    <span className="text-sm font-black" style={{ color: preview.logoColor }}>Smile Dental</span>
                    <button className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: preview.heroBtnBg, color: preview.heroBtnText }}>
                      採用情報
                    </button>
                  </div>
                  {/* Hero */}
                  <div className="h-16 flex items-center px-3" style={{ background: preview.accent }}>
                    <div>
                      <div className="h-2 w-24 rounded mb-1.5" style={{ background: 'rgba(255,255,255,0.8)' }} />
                      <div className="h-1.5 w-16 rounded" style={{ background: 'rgba(255,255,255,0.5)' }} />
                    </div>
                  </div>
                  {/* Cards section */}
                  <div className="p-3 grid grid-cols-3 gap-2" style={{ background: preview.sectionAltBg }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} className="rounded-lg p-2" style={{ background: preview.cardBg, border: `1px solid ${preview.dividerColor}` }}>
                        <div className="w-4 h-4 rounded-full mb-1" style={{ background: preview.cardIconBg, border: `2px solid ${preview.accent}` }} />
                        <div className="h-1.5 w-full rounded" style={{ background: preview.dividerColor }} />
                      </div>
                    ))}
                  </div>
                  {/* Footer */}
                  <div className="h-8 px-3 flex items-center" style={{ background: preview.footerBg }}>
                    <div className="h-1.5 w-20 rounded" style={{ background: preview.footerText, opacity: 0.4 }} />
                  </div>
                </div>

                {/* Color strip */}
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1.5">カラーパレット</p>
                  <ThemeStrip theme={preview} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={!form.nameJa.trim() || saving}
                className="px-5 py-2 text-sm font-bold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '保存中…' : editingId ? '変更を保存' : 'テーマを作成'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-bold text-gray-900 mb-2">テーマを削除しますか？</h2>
            <p className="text-sm text-gray-500 mb-5">
              このテーマを使用しているクリニックのページには影響しません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
