'use client'

import { useState, useRef, useEffect } from 'react'
import {
  saveTemplate, loadAllTemplates, deleteTemplate,
  type FreeTemplate, type TemplateSection, type TemplateColumn, type Block, type FontChoice,
  type ColLayout, TEMPLATE_VARS, IMAGE_SLOTS,
} from '@/lib/templateStorage'
import { FreeTemplateRenderer } from '@/components/clinic/FreeTemplateRenderer'
import { loadAllThemes } from '@/lib/themeStorage'
import type { LPTheme } from '@/components/clinic/LandingPageRenderer'

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 9) }

const EMPTY_TEMPLATE: FreeTemplate = {
  nameJa: '新しいテンプレート',
  desc: '',
  fontFamily: 'noto-sans',
  sections: [],
}

// ── Preset templates ──────────────────────────────────────────────────────────

function makePreset(): FreeTemplate {
  const b = (block: Omit<Block, 'id'>): Block => ({ id: uid(), ...block } as Block)
  const col = (...blocks: Block[]): TemplateColumn => ({ id: uid(), blocks })
  const sec = (sectionType: string, layout: ColLayout, bg: TemplateSection['bg'], py: TemplateSection['py'], columns: TemplateColumn[]): TemplateSection =>
    ({ id: uid(), sectionType, layout, bg, py, columns })

  return {
    nameJa: '歯科クリニック プレミアム',
    desc: '洗練されたレイアウトのフルページテンプレート',
    fontFamily: 'zen-gothic',
    sections: [
      // ① お知らせバー
      sec('topbar', '1', 'dark', 'sm', [
        col(b({ type: 'paragraph', text: '✨ {{tagline}}', size: 'sm', align: 'center', color: 'white' }))
      ]),

      // ② ヘッダー
      sec('header', '2', 'white', 'sm', [
        col(b({ type: 'heading', text: '{{clinicName}}', size: 'xl', weight: 'bold', align: 'left', color: 'default' })),
        col(b({ type: 'button', text: '採用情報を見る', align: 'right', btnStyle: 'outlined' })),
      ]),

      // ③ ヒーロー
      sec('hero', '1', 'white', 'sm', [
        col(
          b({ type: 'image-slot', slot: 'hero', imgHeight: 520, imgShape: 'rect' }),
          b({ type: 'spacer', height: 32 }),
          b({ type: 'heading', text: '{{heroTitle}}', size: '4xl', weight: 'black', align: 'center', color: 'default' }),
          b({ type: 'paragraph', text: '{{heroSubtitle}}', size: 'lg', align: 'center', color: 'muted' }),
          b({ type: 'spacer', height: 8 }),
          b({ type: 'button', text: '{{ctaText}}', align: 'center', btnStyle: 'filled' }),
        )
      ]),

      // ④ 選ばれる理由
      sec('features', '3', 'alt', 'lg', [
        col(
          b({ type: 'heading', text: '🏆 最新設備', size: 'lg', weight: 'bold', align: 'center', color: 'default' }),
          b({ type: 'divider' }),
          b({ type: 'paragraph', text: '最先端の歯科医療機器を導入し、精密で安心の治療を提供しています。', size: 'sm', align: 'center', color: 'default' }),
        ),
        col(
          b({ type: 'heading', text: '💬 丁寧な説明', size: 'lg', weight: 'bold', align: 'center', color: 'default' }),
          b({ type: 'divider' }),
          b({ type: 'paragraph', text: '治療前に必ずご説明し、患者様が納得された上で治療を進めます。', size: 'sm', align: 'center', color: 'default' }),
        ),
        col(
          b({ type: 'heading', text: '🤝 完全個室', size: 'lg', weight: 'bold', align: 'center', color: 'default' }),
          b({ type: 'divider' }),
          b({ type: 'paragraph', text: '完全個室の診療室でプライバシーを守りながらリラックスして受診いただけます。', size: 'sm', align: 'center', color: 'default' }),
        ),
      ]),

      // ⑤ クリニックの想い
      sec('concept', '1+2', 'white', 'lg', [
        col(
          b({ type: 'heading', text: '私たちのこだわり', size: '3xl', weight: 'black', align: 'left', color: 'default' }),
          b({ type: 'spacer', height: 16 }),
          b({ type: 'paragraph', text: '患者様おひとりおひとりの笑顔のために、私たちは妥協のない医療を追求し続けています。\n\n地域に根ざしたクリニックとして、歯の健康を通じて皆様の生活の質を高めることが私たちの使命です。', size: 'base', align: 'left', color: 'default' }),
          b({ type: 'spacer', height: 16 }),
          b({ type: 'button', text: '院長からのメッセージ', align: 'left', btnStyle: 'ghost' }),
        ),
        col(
          b({ type: 'image-slot', slot: 'concept', imgHeight: 360, imgShape: 'rounded' }),
        ),
      ]),

      // ⑥ 診療内容
      sec('services', '3', 'alt', 'lg', [
        col(
          b({ type: 'heading', text: '🦷 一般歯科', size: 'base', weight: 'bold', align: 'left', color: 'accent' }),
          b({ type: 'paragraph', text: 'むし歯治療・歯周病ケアから定期検診まで、基本的な歯科医療をトータルサポートします。', size: 'sm', align: 'left', color: 'default' }),
        ),
        col(
          b({ type: 'heading', text: '✨ 審美・矯正', size: 'base', weight: 'bold', align: 'left', color: 'accent' }),
          b({ type: 'paragraph', text: 'ホワイトニング、セラミック、マウスピース矯正など、美しい歯並びと白い歯を実現します。', size: 'sm', align: 'left', color: 'default' }),
        ),
        col(
          b({ type: 'heading', text: '🔬 インプラント', size: 'base', weight: 'bold', align: 'left', color: 'accent' }),
          b({ type: 'paragraph', text: '最新のインプラント技術で、失った歯の機能と見た目を自然に回復させます。', size: 'sm', align: 'left', color: 'default' }),
        ),
      ]),

      // ⑦ スタッフ紹介
      sec('staff', '1+2', 'white', 'lg', [
        col(
          b({ type: 'image-slot', slot: 'staff', imgHeight: 340, imgShape: 'rounded' }),
        ),
        col(
          b({ type: 'paragraph', text: '院長メッセージ', size: 'sm', align: 'left', color: 'muted' }),
          b({ type: 'heading', text: '{{staffName}}', size: '2xl', weight: 'bold', align: 'left', color: 'default' }),
          b({ type: 'paragraph', text: '{{staffTitle}}', size: 'sm', align: 'left', color: 'accent' }),
          b({ type: 'divider' }),
          b({ type: 'paragraph', text: '{{staffMessage}}', size: 'base', align: 'left', color: 'default' }),
        ),
      ]),

      // ⑧ ギャラリー
      sec('gallery', '3', 'alt', 'md', [
        col(b({ type: 'image-slot', slot: 'gallery-1', imgHeight: 220, imgShape: 'rounded' })),
        col(b({ type: 'image-slot', slot: 'gallery-2', imgHeight: 220, imgShape: 'rounded' })),
        col(b({ type: 'image-slot', slot: 'gallery-3', imgHeight: 220, imgShape: 'rounded' })),
      ]),

      // ⑨ 予約CTA
      sec('cta_banner', '1', 'accent', 'lg', [
        col(
          b({ type: 'heading', text: '一緒に働きませんか？', size: '3xl', weight: 'black', align: 'center', color: 'white' }),
          b({ type: 'paragraph', text: 'スタッフ一同、あなたのご応募をお待ちしております。', size: 'base', align: 'center', color: 'white' }),
          b({ type: 'spacer', height: 8 }),
          b({ type: 'button', text: '求人に応募する', align: 'center', btnStyle: 'filled' }),
        )
      ]),

      // ⑩ アクセス・診療時間
      sec('contact', '2', 'white', 'lg', [
        col(
          b({ type: 'heading', text: 'アクセス・診療時間', size: '2xl', weight: 'bold', align: 'left', color: 'default' }),
          b({ type: 'spacer', height: 12 }),
          b({ type: 'paragraph', text: '📍 {{address}}', size: 'sm', align: 'left', color: 'default' }),
          b({ type: 'paragraph', text: '📞 {{phone}}', size: 'sm', align: 'left', color: 'default' }),
          b({ type: 'paragraph', text: '🕐 {{hours}}', size: 'sm', align: 'left', color: 'default' }),
        ),
        col(
          b({ type: 'image-slot', slot: 'concept', imgHeight: 220, imgShape: 'rounded' }),
        ),
      ]),

      // ⑪ フッター
      sec('footer', '1', 'dark', 'md', [
        col(
          b({ type: 'heading', text: '{{clinicName}}', size: 'base', weight: 'bold', align: 'center', color: 'white' }),
          b({ type: 'paragraph', text: '{{address}}  |  {{phone}}', size: 'sm', align: 'center', color: 'muted' }),
        )
      ]),
    ],
  }
}

const LAYOUT_OPTIONS: { value: ColLayout; label: string }[] = [
  { value: '1',   label: '1列' },
  { value: '2',   label: '2列' },
  { value: '3',   label: '3列' },
  { value: '2+1', label: '2:1' },
  { value: '1+2', label: '1:2' },
]

const BG_OPTIONS: { value: TemplateSection['bg']; label: string; color: string }[] = [
  { value: 'white',  label: '白',     color: '#ffffff' },
  { value: 'alt',    label: 'グレー', color: '#f8fafc' },
  { value: 'accent', label: 'アクセント', color: '#0891b2' },
  { value: 'dark',   label: 'ダーク', color: '#0f172a' },
]

const PY_OPTIONS: { value: TemplateSection['py']; label: string }[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
  { value: 'xl', label: 'XL' },
]

const BLOCK_TYPES: { type: Block['type']; icon: string; label: string }[] = [
  { type: 'heading',    icon: 'H',  label: '見出し' },
  { type: 'paragraph',  icon: '¶',  label: '本文' },
  { type: 'image-slot', icon: '🖼', label: '画像' },
  { type: 'button',     icon: '⬛', label: 'ボタン' },
  { type: 'divider',    icon: '—',  label: '区切り線' },
  { type: 'spacer',     icon: '↕',  label: 'スペース' },
]

const GRID_MAP: Record<ColLayout, string> = {
  '1':   '1fr',
  '2':   '1fr 1fr',
  '3':   '1fr 1fr 1fr',
  '2+1': '2fr 1fr',
  '1+2': '1fr 2fr',
}

// ── Default constructors ──────────────────────────────────────────────────────

function defaultBlock(type: Block['type']): Block {
  const id = uid()
  switch (type) {
    case 'heading':    return { id, type, text: '見出しテキスト', size: '2xl', weight: 'bold', align: 'left', color: 'default' }
    case 'paragraph':  return { id, type, text: '本文テキストを入力してください。', size: 'base', align: 'left', color: 'default' }
    case 'image-slot': return { id, type, slot: 'hero', imgHeight: 240, imgShape: 'rect' }
    case 'button':     return { id, type, text: 'ボタンテキスト', align: 'left', btnStyle: 'filled' }
    case 'divider':    return { id, type }
    case 'spacer':     return { id, type, height: 24 }
  }
}

function colCount(layout: ColLayout): number {
  return layout === '1' ? 1 : layout === '3' ? 3 : 2
}

function makeColumns(layout: ColLayout, existing: TemplateColumn[]): TemplateColumn[] {
  const n = colCount(layout)
  return Array.from({ length: n }, (_, i) => existing[i] ?? { id: uid(), blocks: [] })
}

function defaultSection(): TemplateSection {
  return { id: uid(), layout: '1', columns: [{ id: uid(), blocks: [] }], bg: 'white', py: 'md' }
}

// ── Section type catalogue ────────────────────────────────────────────────────

const SECTION_TYPES: { type: string; icon: string; label: string }[] = [
  { type: 'topbar',     icon: '📢', label: 'お知らせバー' },
  { type: 'header',     icon: '🏷️', label: 'ヘッダー' },
  { type: 'hero',       icon: '🖼️', label: 'ヒーロー画像' },
  { type: 'concept',    icon: '💭', label: 'クリニックの想い' },
  { type: 'features',   icon: '⭐', label: '選ばれる理由' },
  { type: 'services',   icon: '🦷', label: '診療内容' },
  { type: 'staff',      icon: '👨‍⚕️', label: 'スタッフ紹介' },
  { type: 'gallery',    icon: '🖼️', label: 'ギャラリー' },
  { type: 'contact',    icon: '📍', label: 'アクセス・診療時間' },
  { type: 'cta_banner', icon: '📣', label: '予約CTAバー' },
  { type: 'footer',     icon: '📄', label: 'フッター' },
]

function defaultSectionForType(type: string): TemplateSection {
  const id = uid()
  const b = (block: Omit<Block, 'id'>): Block => ({ id: uid(), ...block } as Block)
  const col = (blocks: Block[]): TemplateColumn => ({ id: uid(), blocks })
  switch (type) {
    case 'topbar':
      return { id, sectionType: type, layout: '1', bg: 'dark', py: 'sm',
        columns: [col([b({ type: 'paragraph', text: '{{tagline}}', size: 'sm', align: 'center', color: 'white' })])] }
    case 'header':
      return { id, sectionType: type, layout: '2', bg: 'white', py: 'sm',
        columns: [
          col([b({ type: 'heading', text: '{{clinicName}}', size: 'xl', weight: 'bold', align: 'left', color: 'default' })]),
          col([b({ type: 'button', text: '採用情報を見る', align: 'right', btnStyle: 'filled' })]),
        ] }
    case 'hero':
      return { id, sectionType: type, layout: '1', bg: 'white', py: 'lg',
        columns: [col([
          b({ type: 'image-slot', slot: 'hero', imgHeight: 400, imgShape: 'rect' }),
          b({ type: 'heading', text: '{{heroTitle}}', size: '3xl', weight: 'bold', align: 'center', color: 'default' }),
          b({ type: 'paragraph', text: '{{heroSubtitle}}', size: 'base', align: 'center', color: 'default' }),
          b({ type: 'button', text: '{{ctaText}}', align: 'center', btnStyle: 'filled' }),
        ])] }
    case 'concept':
      return { id, sectionType: type, layout: '2', bg: 'white', py: 'md',
        columns: [
          col([
            b({ type: 'heading', text: 'クリニックの想い', size: '2xl', weight: 'bold', align: 'left', color: 'default' }),
            b({ type: 'paragraph', text: '本文テキストを入力してください。', size: 'base', align: 'left', color: 'default' }),
          ]),
          col([b({ type: 'image-slot', slot: 'concept', imgHeight: 300, imgShape: 'rounded' })]),
        ] }
    case 'features':
      return { id, sectionType: type, layout: '3', bg: 'alt', py: 'md',
        columns: [
          col([b({ type: 'heading', text: '理由 1', size: 'lg', weight: 'bold', align: 'center', color: 'default' }), b({ type: 'paragraph', text: '説明文', size: 'sm', align: 'center', color: 'default' })]),
          col([b({ type: 'heading', text: '理由 2', size: 'lg', weight: 'bold', align: 'center', color: 'default' }), b({ type: 'paragraph', text: '説明文', size: 'sm', align: 'center', color: 'default' })]),
          col([b({ type: 'heading', text: '理由 3', size: 'lg', weight: 'bold', align: 'center', color: 'default' }), b({ type: 'paragraph', text: '説明文', size: 'sm', align: 'center', color: 'default' })]),
        ] }
    case 'services':
      return { id, sectionType: type, layout: '3', bg: 'white', py: 'md',
        columns: [
          col([b({ type: 'heading', text: '診療内容 1', size: 'base', weight: 'bold', align: 'left', color: 'default' }), b({ type: 'paragraph', text: '説明文', size: 'sm', align: 'left', color: 'default' })]),
          col([b({ type: 'heading', text: '診療内容 2', size: 'base', weight: 'bold', align: 'left', color: 'default' }), b({ type: 'paragraph', text: '説明文', size: 'sm', align: 'left', color: 'default' })]),
          col([b({ type: 'heading', text: '診療内容 3', size: 'base', weight: 'bold', align: 'left', color: 'default' }), b({ type: 'paragraph', text: '説明文', size: 'sm', align: 'left', color: 'default' })]),
        ] }
    case 'staff':
      return { id, sectionType: type, layout: '2', bg: 'alt', py: 'md',
        columns: [
          col([b({ type: 'image-slot', slot: 'staff', imgHeight: 280, imgShape: 'rounded' })]),
          col([
            b({ type: 'heading', text: '{{staffName}}', size: 'xl', weight: 'bold', align: 'left', color: 'default' }),
            b({ type: 'paragraph', text: '{{staffTitle}}', size: 'sm', align: 'left', color: 'muted' }),
            b({ type: 'paragraph', text: '{{staffMessage}}', size: 'base', align: 'left', color: 'default' }),
          ]),
        ] }
    case 'gallery':
      return { id, sectionType: type, layout: '3', bg: 'white', py: 'md',
        columns: [
          col([b({ type: 'image-slot', slot: 'gallery-1', imgHeight: 240, imgShape: 'rect' })]),
          col([b({ type: 'image-slot', slot: 'gallery-2', imgHeight: 240, imgShape: 'rect' })]),
          col([b({ type: 'image-slot', slot: 'gallery-3', imgHeight: 240, imgShape: 'rect' })]),
        ] }
    case 'contact':
      return { id, sectionType: type, layout: '2', bg: 'alt', py: 'md',
        columns: [
          col([
            b({ type: 'heading', text: 'アクセス・診療時間', size: 'xl', weight: 'bold', align: 'left', color: 'default' }),
            b({ type: 'paragraph', text: '{{address}}', size: 'sm', align: 'left', color: 'default' }),
            b({ type: 'paragraph', text: '{{phone}}', size: 'sm', align: 'left', color: 'default' }),
            b({ type: 'paragraph', text: '{{hours}}', size: 'sm', align: 'left', color: 'default' }),
          ]),
          col([b({ type: 'image-slot', slot: 'concept', imgHeight: 220, imgShape: 'rounded' })]),
        ] }
    case 'cta_banner':
      return { id, sectionType: type, layout: '1', bg: 'accent', py: 'md',
        columns: [col([
          b({ type: 'heading', text: '一緒に働きませんか？', size: '2xl', weight: 'bold', align: 'center', color: 'white' }),
          b({ type: 'button', text: '求人に応募する', align: 'center', btnStyle: 'filled' }),
        ])] }
    case 'footer':
      return { id, sectionType: type, layout: '1', bg: 'dark', py: 'md',
        columns: [col([
          b({ type: 'heading', text: '{{clinicName}}', size: 'base', weight: 'semibold', align: 'center', color: 'white' }),
          b({ type: 'paragraph', text: '{{address}}', size: 'sm', align: 'center', color: 'white' }),
        ])] }
    default:
      return { id, sectionType: type, layout: '1', bg: 'white', py: 'md', columns: [col([])] }
  }
}

// ── Add Block Menu ────────────────────────────────────────────────────────────

function AddBlockMenu({ onAdd }: { onAdd: (type: Block['type']) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full py-1 text-[11px] text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded border border-dashed border-gray-200 hover:border-violet-300 transition font-semibold"
      >
        ＋ ブロックを追加
      </button>
      {open && (
        <div className="absolute left-0 z-20 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-1 mt-1">
          {BLOCK_TYPES.map(bt => (
            <button
              key={bt.type}
              onClick={() => { onAdd(bt.type); setOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition text-left"
            >
              <span className="text-sm w-5 text-center">{bt.icon}</span>
              {bt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Block Editor (right panel) ────────────────────────────────────────────────

function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  const ic = 'w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400'

  return (
    <div className="space-y-3 p-4">
      {(block.type === 'heading' || block.type === 'paragraph' || block.type === 'button') && (
        <>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">テキスト</label>
            <textarea
              className={`${ic} resize-none`}
              rows={3}
              value={block.text ?? ''}
              onChange={e => onChange({ ...block, text: e.target.value })}
            />
            <div className="mt-1.5 flex flex-wrap gap-1">
              {TEMPLATE_VARS.map(v => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => onChange({ ...block, text: (block.text ?? '') + v.key })}
                  className="px-1.5 py-0.5 text-[10px] bg-violet-50 text-violet-700 rounded border border-violet-200 hover:bg-violet-100 transition"
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">配置</label>
              <select className={ic} value={block.align ?? 'left'} onChange={e => onChange({ ...block, align: e.target.value as Block['align'] })}>
                <option value="left">左</option>
                <option value="center">中央</option>
                <option value="right">右</option>
              </select>
            </div>
            {block.type !== 'button' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">文字サイズ</label>
                <select className={ic} value={block.size ?? 'base'} onChange={e => onChange({ ...block, size: e.target.value as Block['size'] })}>
                  {['sm','base','lg','xl','2xl','3xl','4xl'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          {block.type !== 'button' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">太さ</label>
                <select className={ic} value={block.weight ?? 'normal'} onChange={e => onChange({ ...block, weight: e.target.value as Block['weight'] })}>
                  <option value="normal">通常</option>
                  <option value="semibold">セミボールド</option>
                  <option value="bold">ボールド</option>
                  <option value="black">ブラック</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">色</label>
                <select className={ic} value={block.color ?? 'default'} onChange={e => onChange({ ...block, color: e.target.value as Block['color'] })}>
                  <option value="default">デフォルト</option>
                  <option value="accent">アクセント</option>
                  <option value="muted">グレー</option>
                  <option value="white">白</option>
                </select>
              </div>
            </div>
          )}

          {block.type === 'button' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">スタイル</label>
              <select className={ic} value={block.btnStyle ?? 'filled'} onChange={e => onChange({ ...block, btnStyle: e.target.value as Block['btnStyle'] })}>
                <option value="filled">塗りつぶし</option>
                <option value="outlined">枠線</option>
                <option value="ghost">ゴースト</option>
              </select>
            </div>
          )}
        </>
      )}

      {block.type === 'image-slot' && (
        <>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">画像スロット</label>
            <select className={ic} value={block.slot ?? 'hero'} onChange={e => onChange({ ...block, slot: e.target.value as Block['slot'] })}>
              {IMAGE_SLOTS.map(s => <option key={s.slot} value={s.slot}>{s.label}</option>)}
            </select>
            <p className="text-[10px] text-gray-400 mt-1">クリニックが設定した対応する画像が表示されます</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">高さ (px)</label>
            <input type="number" className={ic} value={block.imgHeight ?? 240} min={60} max={800}
              onChange={e => onChange({ ...block, imgHeight: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">形状</label>
            <select className={ic} value={block.imgShape ?? 'rect'} onChange={e => onChange({ ...block, imgShape: e.target.value as Block['imgShape'] })}>
              <option value="rect">四角</option>
              <option value="rounded">角丸</option>
              <option value="circle">円形</option>
            </select>
          </div>
        </>
      )}

      {block.type === 'spacer' && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">高さ (px)</label>
          <input type="number" className={ic} value={block.height ?? 24} min={4} max={300}
            onChange={e => onChange({ ...block, height: Number(e.target.value) })} />
        </div>
      )}

      {block.type === 'divider' && (
        <p className="text-xs text-gray-400">区切り線に設定項目はありません。</p>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Record<string, FreeTemplate>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [template, setTemplate] = useState<FreeTemplate>(EMPTY_TEMPLATE)
  const [selectedBlock, setSelectedBlock] = useState<{ sectionId: string; colId: string; blockId: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [showSectionPicker, setShowSectionPicker] = useState(false)

  // Drag state for sections
  const dragSectionIdx = useRef<number | null>(null)
  const [dragOverSectionIdx, setDragOverSectionIdx] = useState<number | null>(null)

  // Drag state for blocks
  const dragBlockRef = useRef<{ sectionId: string; colId: string; blockId: string } | null>(null)
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null)

  const [previewTheme, setPreviewTheme] = useState<LPTheme | null>(null)

  useEffect(() => {
    loadAllTemplates().then(setTemplates).catch(() => {})
    loadAllThemes()
      .then(themes => {
        const first = Object.values(themes)[0]
        if (first) setPreviewTheme(first)
      })
      .catch(() => {})
  }, [])

  const isEditing = editMode

  // ── Template operations ───────────────────────────────────────────────────

  function loadPreset() {
    setEditingId(null)
    setTemplate(makePreset())
    setSelectedBlock(null)
    setPreviewMode(false)
    setEditMode(true)
  }

  function startNew() {
    setEditingId(null)
    setTemplate({ ...EMPTY_TEMPLATE, sections: [] })
    setSelectedBlock(null)
    setPreviewMode(false)
    setEditMode(true)
  }

  function startEdit(id: string) {
    setEditingId(id)
    setTemplate(structuredClone(templates[id]))
    setSelectedBlock(null)
    setPreviewMode(false)
    setEditMode(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const id = editingId ?? `free_${uid()}`
      await saveTemplate(id, template)
      const updated = await loadAllTemplates()
      setTemplates(updated)
      setEditingId(id)
      setSaveMsg('保存しました')
      setTimeout(() => setSaveMsg(null), 2500)
    } catch {
      setSaveMsg('保存に失敗しました')
      setTimeout(() => setSaveMsg(null), 3000)
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await deleteTemplate(id)
    const updated = await loadAllTemplates()
    setTemplates(updated)
    if (editingId === id) { setEditingId(null); setTemplate({ ...EMPTY_TEMPLATE, sections: [] }); setEditMode(false) }
    setDeleteConfirm(null)
  }

  // ── Section operations ────────────────────────────────────────────────────

  function addSection(type?: string) {
    const section = type ? defaultSectionForType(type) : defaultSection()
    setTemplate(t => ({ ...t, sections: [...t.sections, section] }))
    setShowSectionPicker(false)
  }

  function removeSection(sectionId: string) {
    setTemplate(t => ({ ...t, sections: t.sections.filter(s => s.id !== sectionId) }))
    if (selectedBlock?.sectionId === sectionId) setSelectedBlock(null)
  }

  function updateSection(sectionId: string, patch: Partial<Omit<TemplateSection, 'id' | 'columns'>>) {
    setTemplate(t => ({
      ...t,
      sections: t.sections.map(s => {
        if (s.id !== sectionId) return s
        const next = { ...s, ...patch }
        if (patch.layout) next.columns = makeColumns(patch.layout, s.columns)
        return next
      }),
    }))
  }

  function onSectionDragStart(i: number) { dragSectionIdx.current = i }
  function onSectionDragOver(e: React.DragEvent, i: number) { e.preventDefault(); setDragOverSectionIdx(i) }
  function onSectionDrop(i: number) {
    if (dragSectionIdx.current === null) return
    const next = [...template.sections]
    const [moved] = next.splice(dragSectionIdx.current, 1)
    next.splice(i, 0, moved)
    setTemplate(t => ({ ...t, sections: next }))
    dragSectionIdx.current = null
    setDragOverSectionIdx(null)
  }
  function onSectionDragEnd() { dragSectionIdx.current = null; setDragOverSectionIdx(null) }

  // ── Block operations ──────────────────────────────────────────────────────

  function addBlock(sectionId: string, colId: string, type: Block['type']) {
    const block = defaultBlock(type)
    setTemplate(t => ({
      ...t,
      sections: t.sections.map(s => s.id !== sectionId ? s : {
        ...s,
        columns: s.columns.map(col => col.id !== colId ? col : { ...col, blocks: [...col.blocks, block] }),
      }),
    }))
    setSelectedBlock({ sectionId, colId, blockId: block.id })
  }

  function removeBlock(sectionId: string, colId: string, blockId: string) {
    setTemplate(t => ({
      ...t,
      sections: t.sections.map(s => s.id !== sectionId ? s : {
        ...s,
        columns: s.columns.map(col => col.id !== colId ? col : { ...col, blocks: col.blocks.filter(b => b.id !== blockId) }),
      }),
    }))
    if (selectedBlock?.blockId === blockId) setSelectedBlock(null)
  }

  function updateBlock(sectionId: string, colId: string, updated: Block) {
    setTemplate(t => ({
      ...t,
      sections: t.sections.map(s => s.id !== sectionId ? s : {
        ...s,
        columns: s.columns.map(col => col.id !== colId ? col : { ...col, blocks: col.blocks.map(b => b.id === updated.id ? updated : b) }),
      }),
    }))
  }

  function onBlockDragStart(e: React.DragEvent, sectionId: string, colId: string, blockId: string) {
    e.stopPropagation()
    dragBlockRef.current = { sectionId, colId, blockId }
  }
  function onBlockDragOver(e: React.DragEvent, blockId: string) {
    e.preventDefault()
    e.stopPropagation()
    setDragOverBlockId(blockId)
  }
  function onBlockDrop(e: React.DragEvent, targetSectionId: string, targetColId: string, targetBlockId: string) {
    e.stopPropagation()
    const src = dragBlockRef.current
    if (!src || src.blockId === targetBlockId) { dragBlockRef.current = null; setDragOverBlockId(null); return }
    if (src.sectionId === targetSectionId && src.colId === targetColId) {
      setTemplate(t => ({
        ...t,
        sections: t.sections.map(s => s.id !== targetSectionId ? s : {
          ...s,
          columns: s.columns.map(col => {
            if (col.id !== targetColId) return col
            const next = [...col.blocks]
            const fromI = next.findIndex(b => b.id === src.blockId)
            const toI   = next.findIndex(b => b.id === targetBlockId)
            const [moved] = next.splice(fromI, 1)
            next.splice(toI, 0, moved)
            return { ...col, blocks: next }
          }),
        }),
      }))
    }
    dragBlockRef.current = null
    setDragOverBlockId(null)
  }
  function onBlockDragEnd() { dragBlockRef.current = null; setDragOverBlockId(null) }

  // ── Resolve selected block data ───────────────────────────────────────────

  const selectedBlockData: Block | null = selectedBlock
    ? (template.sections.find(s => s.id === selectedBlock.sectionId)
        ?.columns.find(c => c.id === selectedBlock.colId)
        ?.blocks.find(b => b.id === selectedBlock.blockId) ?? null)
    : null

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left sidebar: template list ── */}
      <div className="w-64 shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-800">テンプレート一覧</span>
          <button
            onClick={startNew}
            className="px-2 py-1 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition"
          >
            ＋ 新規
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2 border-b border-gray-100">
            <button
              onClick={loadPreset}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-50 to-cyan-50 border border-violet-200 hover:border-violet-400 transition text-left"
            >
              <span className="text-base">⭐</span>
              <div>
                <p className="text-xs font-bold text-violet-700">プレミアムプリセット</p>
                <p className="text-[10px] text-gray-400">完成済みテンプレートを読み込む</p>
              </div>
            </button>
          </div>
          {Object.keys(templates).length === 0 && (
            <p className="px-4 py-6 text-xs text-gray-400 text-center">テンプレートがありません<br />「＋ 新規」または上のプリセットで作成</p>
          )}
          {Object.entries(templates).map(([id, tmpl]) => (
            <div
              key={id}
              className={[
                'border-b border-gray-100 px-4 py-3 cursor-pointer hover:bg-gray-50 transition',
                editingId === id ? 'bg-violet-50 border-l-4 border-l-violet-500' : '',
              ].join(' ')}
              onClick={() => startEdit(id)}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm font-semibold text-gray-800 truncate">{tmpl.nameJa}</span>
                <button
                  onClick={e => { e.stopPropagation(); setDeleteConfirm(id) }}
                  className="text-gray-300 hover:text-red-400 transition text-base shrink-0"
                  title="削除"
                >
                  🗑
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {tmpl.desc || `${tmpl.sections.length} セクション`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main area ── */}
      {!isEditing ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-gray-500 text-sm mb-6">左の「＋ 新規」を押してテンプレートを作成してください</p>
            <button
              onClick={startNew}
              className="px-5 py-2.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition"
            >
              ＋ 新しいテンプレートを作成
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* ── Top toolbar ── */}
          <div className="shrink-0 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
            <input
              type="text"
              value={template.nameJa}
              onChange={e => setTemplate(t => ({ ...t, nameJa: e.target.value }))}
              className="w-52 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="テンプレート名"
            />
            <select
              value={template.fontFamily}
              onChange={e => setTemplate(t => ({ ...t, fontFamily: e.target.value as FontChoice }))}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400"
            >
              <optgroup label="ゴシック体（sans-serif）">
                <option value="noto-sans">Noto Sans JP — クリーンなゴシック</option>
                <option value="biz-ud">BIZ UD ゴシック — 読みやすい公式体</option>
                <option value="zen-gothic">Zen Kaku Gothic — スタイリッシュ</option>
                <option value="mplus-rounded">M PLUS Rounded — やわらか丸ゴシック</option>
              </optgroup>
              <optgroup label="明朝体（serif）">
                <option value="noto-serif">Noto Serif JP — エレガントな明朝体</option>
                <option value="shippori">Shippori Mincho — 上品な明朝体</option>
              </optgroup>
            </select>
            <div className="flex-1" />
            {saveMsg && (
              <span className={['text-xs font-semibold', saveMsg.includes('失敗') ? 'text-red-500' : 'text-green-600'].join(' ')}>
                {saveMsg}
              </span>
            )}
            <button
              onClick={() => setPreviewMode(p => !p)}
              className={[
                'px-3 py-1.5 text-sm font-semibold rounded-lg border transition',
                previewMode
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
              ].join(' ')}
            >
              {previewMode ? '✏️ 編集に戻る' : '👁 プレビュー'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition disabled:opacity-50"
            >
              {saving ? '保存中…' : '💾 保存'}
            </button>
          </div>

          {previewMode ? (
            /* ── Preview mode ── */
            <div className="flex-1 overflow-auto bg-gray-100 p-6">
              <div className="bg-white rounded-xl shadow overflow-hidden max-w-4xl mx-auto">
                {template.sections.length === 0
                  ? <div className="flex items-center justify-center h-40 text-gray-400 text-sm">セクションがまだありません</div>
                  : previewTheme && <FreeTemplateRenderer template={template} sections={[]} t={previewTheme} showPlaceholders />
                }
              </div>
            </div>
          ) : (
            /* ── Builder mode ── */
            <div className="flex-1 flex overflow-hidden">

              {/* Canvas */}
              <div className="flex-1 overflow-auto bg-gray-100 p-4">
                <div className="max-w-4xl mx-auto space-y-3">

                  {template.sections.length === 0 && (
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-10 text-center">
                      <p className="text-sm font-semibold text-gray-400 mb-1">セクションがまだありません</p>
                      <p className="text-xs text-gray-400 mb-4">下のボタンからセクションを追加してください</p>
                      <button
                        onClick={() => setShowSectionPicker(true)}
                        className="px-5 py-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition"
                      >
                        ＋ 最初のセクションを追加
                      </button>
                    </div>
                  )}

                  {template.sections.map((section, sIdx) => (
                    <div
                      key={section.id}
                      draggable
                      onDragStart={() => onSectionDragStart(sIdx)}
                      onDragOver={e => onSectionDragOver(e, sIdx)}
                      onDrop={() => onSectionDrop(sIdx)}
                      onDragEnd={onSectionDragEnd}
                      className={[
                        'bg-white rounded-xl border-2 transition',
                        dragOverSectionIdx === sIdx ? 'border-violet-400' : 'border-gray-200',
                      ].join(' ')}
                    >
                      {/* Section header bar */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap rounded-t-xl">
                        <span className="text-gray-300 cursor-grab select-none text-base">⠿</span>
                        {(() => {
                          const meta = SECTION_TYPES.find(st => st.type === section.sectionType)
                          return meta
                            ? <span className="text-xs font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">{meta.icon} {meta.label}</span>
                            : <span className="text-xs font-bold text-gray-500">セクション {sIdx + 1}</span>
                        })()}

                        {/* Layout */}
                        <div className="flex gap-1">
                          {LAYOUT_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => updateSection(section.id, { layout: opt.value })}
                              className={[
                                'px-2 py-0.5 text-xs rounded border transition',
                                section.layout === opt.value
                                  ? 'bg-violet-600 text-white border-violet-600'
                                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50',
                              ].join(' ')}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        <span className="text-gray-200 text-xs">|</span>

                        {/* Background */}
                        <div className="flex gap-1 items-center">
                          <span className="text-[10px] text-gray-400">背景</span>
                          {BG_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => updateSection(section.id, { bg: opt.value })}
                              title={opt.label}
                              className={[
                                'w-5 h-5 rounded border transition',
                                section.bg === opt.value ? 'ring-2 ring-violet-500 ring-offset-1' : 'border-gray-300',
                              ].join(' ')}
                              style={{ background: opt.color }}
                            />
                          ))}
                        </div>

                        <span className="text-gray-200 text-xs">|</span>

                        {/* Padding */}
                        <div className="flex gap-1 items-center">
                          <span className="text-[10px] text-gray-400">余白</span>
                          {PY_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => updateSection(section.id, { py: opt.value })}
                              className={[
                                'px-1.5 py-0.5 text-xs rounded border transition',
                                section.py === opt.value
                                  ? 'bg-violet-600 text-white border-violet-600'
                                  : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50',
                              ].join(' ')}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        <div className="flex-1" />
                        <button
                          onClick={() => removeSection(section.id)}
                          className="text-gray-400 hover:text-red-500 transition text-xs px-1"
                          title="セクションを削除"
                        >
                          ✕ 削除
                        </button>
                      </div>

                      {/* Columns grid */}
                      <div className="overflow-x-auto">
                      <div
                        className="p-3"
                        style={{ display: 'grid', gridTemplateColumns: GRID_MAP[section.layout], gap: '12px', minWidth: section.layout === '1' ? undefined : '480px' }}
                      >
                        {section.columns.map((col, cIdx) => (
                          <div
                            key={col.id}
                            className="min-h-[80px] border border-dashed border-gray-200 rounded-lg p-2 flex flex-col gap-2 bg-gray-50/50"
                          >
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">列 {cIdx + 1}</span>

                            {/* Blocks */}
                            {col.blocks.map(block => {
                              const isSelected = selectedBlock?.blockId === block.id
                              const isDragOver  = dragOverBlockId === block.id
                              const typeLabel   = BLOCK_TYPES.find(bt => bt.type === block.type)?.label ?? block.type
                              const preview     = block.text
                                ? ` — ${block.text.slice(0, 22)}${block.text.length > 22 ? '…' : ''}`
                                : block.type === 'image-slot'
                                  ? ` — ${IMAGE_SLOTS.find(s => s.slot === block.slot)?.label ?? block.slot}`
                                  : ''
                              return (
                                <div
                                  key={block.id}
                                  draggable
                                  onDragStart={e => onBlockDragStart(e, section.id, col.id, block.id)}
                                  onDragOver={e => onBlockDragOver(e, block.id)}
                                  onDrop={e => onBlockDrop(e, section.id, col.id, block.id)}
                                  onDragEnd={onBlockDragEnd}
                                  onClick={() => setSelectedBlock({ sectionId: section.id, colId: col.id, blockId: block.id })}
                                  className={[
                                    'flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer select-none transition',
                                    isSelected
                                      ? 'border-violet-500 bg-violet-50 shadow-sm'
                                      : 'border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/30',
                                    isDragOver ? 'border-t-2 border-t-violet-500' : '',
                                  ].join(' ')}
                                >
                                  <span className="text-gray-300 cursor-grab text-xs select-none">⠿</span>
                                  <span className="text-xs font-semibold text-gray-600 flex-1 truncate">
                                    {typeLabel}{preview}
                                  </span>
                                  <button
                                    onClick={e => { e.stopPropagation(); removeBlock(section.id, col.id, block.id) }}
                                    className="text-gray-300 hover:text-red-400 text-xs transition shrink-0"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )
                            })}

                            <AddBlockMenu onAdd={type => addBlock(section.id, col.id, type)} />
                          </div>
                        ))}
                      </div>
                      </div>
                    </div>
                  ))}

                  {/* Add section button */}
                  <button
                    onClick={() => setShowSectionPicker(true)}
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50/50 transition font-semibold"
                  >
                    ＋ セクションを追加
                  </button>
                </div>
              </div>

              {/* Right: Properties panel */}
              {selectedBlockData && (
                <div className="w-64 shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800">
                      {BLOCK_TYPES.find(bt => bt.type === selectedBlockData.type)?.label ?? 'ブロック'} 設定
                    </span>
                    <button onClick={() => setSelectedBlock(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <BlockEditor
                      block={selectedBlockData}
                      onChange={b => updateBlock(selectedBlock!.sectionId, selectedBlock!.colId, b)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Section type picker modal */}
      {showSectionPicker && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6" onClick={() => setShowSectionPicker(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 mb-1">セクションの種類を選択</h3>
            <p className="text-xs text-gray-400 mb-4">選択するとその種類に合ったブロックが自動で配置されます</p>
            <div className="grid grid-cols-2 gap-2">
              {SECTION_TYPES.map(st => (
                <button
                  key={st.type}
                  onClick={() => addSection(st.type)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 hover:border-violet-400 hover:bg-violet-50 text-left transition"
                >
                  <span className="text-lg">{st.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{st.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSectionPicker(false)}
              className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 mb-2">テンプレートを削除しますか？</h3>
            <p className="text-sm text-gray-500 mb-5">
              「{templates[deleteConfirm]?.nameJa}」を削除します。この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition"
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
