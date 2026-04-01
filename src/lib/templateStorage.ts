// Template storage — backed by PostgreSQL via /api/lp/templates
// Replaces the previous IndexedDB implementation; public interface is unchanged.

// ── Block types ───────────────────────────────────────────────────────────────

export type BlockType = 'image-slot' | 'heading' | 'paragraph' | 'button' | 'divider' | 'spacer'

export type ImageSlot =
  | 'hero'
  | 'staff'
  | 'concept'
  | 'gallery-1'
  | 'gallery-2'
  | 'gallery-3'
  | 'gallery-4'
  | 'gallery-5'
  | 'gallery-6'

export interface Block {
  id:      string
  type:    BlockType
  // image-slot
  slot?:   ImageSlot
  imgShape?: 'rect' | 'rounded' | 'circle'
  imgHeight?: number   // px
  // heading / paragraph / button
  text?:   string      // may include {{variables}}
  // style
  align?:  'left' | 'center' | 'right'
  size?:   'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  weight?: 'normal' | 'semibold' | 'bold' | 'black'
  color?:  'default' | 'accent' | 'muted' | 'white'
  // button extras
  btnStyle?: 'filled' | 'outlined' | 'ghost'
  // spacer
  height?: number  // px
}

export type ColLayout = '1' | '2' | '3' | '2+1' | '1+2'

export interface TemplateColumn {
  id:     string
  blocks: Block[]
}

export interface TemplateSection {
  id:          string
  sectionType?: string  // maps to LandingPageBuilder section types
  layout:      ColLayout
  columns:     TemplateColumn[]
  bg:          'white' | 'alt' | 'accent' | 'dark'
  py:          'sm' | 'md' | 'lg' | 'xl'
}

export type FontChoice =
  | 'sans'            // legacy / Noto Sans JP
  | 'serif'           // legacy / Noto Serif JP
  | 'noto-sans'       // Noto Sans JP — クリーンなゴシック体
  | 'noto-serif'      // Noto Serif JP — エレガントな明朝体
  | 'mplus-rounded'   // M PLUS Rounded 1c — やわらかい丸ゴシック
  | 'biz-ud'          // BIZ UDPGothic — 読みやすいUDゴシック
  | 'zen-gothic'      // Zen Kaku Gothic New — スタイリッシュなゴシック
  | 'shippori'        // Shippori Mincho — 上品な明朝体

export interface FreeTemplate {
  nameJa:     string
  desc:       string
  fontFamily: FontChoice
  sections:   TemplateSection[]
}

// ── Available variables to insert into text blocks ────────────────────────────
export const TEMPLATE_VARS: { key: string; label: string }[] = [
  { key: '{{clinicName}}',  label: 'クリニック名' },
  { key: '{{tagline}}',     label: 'タグライン' },
  { key: '{{heroTitle}}',   label: 'ヒーロータイトル' },
  { key: '{{heroSubtitle}}',label: 'ヒーローサブタイトル' },
  { key: '{{ctaText}}',     label: 'CTAボタンテキスト' },
  { key: '{{staffName}}',   label: 'スタッフ名' },
  { key: '{{staffTitle}}',  label: 'スタッフ役職' },
  { key: '{{staffMessage}}',label: 'スタッフメッセージ' },
  { key: '{{address}}',     label: '住所' },
  { key: '{{phone}}',       label: '電話番号' },
  { key: '{{hours}}',       label: '診療時間' },
]

export const IMAGE_SLOTS: { slot: ImageSlot; label: string }[] = [
  { slot: 'hero',      label: 'ヒーロー画像' },
  { slot: 'staff',     label: 'スタッフ写真' },
  { slot: 'concept',   label: 'クリニック画像' },
  { slot: 'gallery-1', label: 'ギャラリー 1' },
  { slot: 'gallery-2', label: 'ギャラリー 2' },
  { slot: 'gallery-3', label: 'ギャラリー 3' },
  { slot: 'gallery-4', label: 'ギャラリー 4' },
  { slot: 'gallery-5', label: 'ギャラリー 5' },
  { slot: 'gallery-6', label: 'ギャラリー 6' },
]

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function saveTemplate(id: string, tpl: FreeTemplate): Promise<void> {
  const res = await fetch('/api/lp/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, template: tpl }),
  })
  if (!res.ok) throw new Error(`saveTemplate failed: ${res.status}`)
}

export async function loadAllTemplates(): Promise<Record<string, FreeTemplate>> {
  const res = await fetch('/api/lp/templates')
  if (!res.ok) throw new Error(`loadAllTemplates failed: ${res.status}`)
  return res.json() as Promise<Record<string, FreeTemplate>>
}

export async function deleteTemplate(id: string): Promise<void> {
  const res = await fetch(`/api/lp/templates/${encodeURIComponent(id)}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`deleteTemplate failed: ${res.status}`)
}
