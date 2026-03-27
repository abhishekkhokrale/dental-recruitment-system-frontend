'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import {
  LandingPageRenderer,
  DEFAULT_SECTIONS,
  THEMES,
  TEMPLATES,
  type LPTheme,
  type PageSection,
  type ThemeId,
  type TemplateId,
} from './LandingPageRenderer'
import { lpSave } from '@/lib/lpStorage'
import { loadAllThemes } from '@/lib/themeStorage'
import { loadAllTemplates, type FreeTemplate } from '@/lib/templateStorage'

// ─── Section meta ────────────────────────────────────────────────────────────

const SECTION_META: Record<string, { icon: string; label: string }> = {
  topbar:     { icon: '📢', label: 'お知らせバー' },
  header:     { icon: '🏷️', label: 'ヘッダー' },
  hero:       { icon: '🖼️', label: 'ヒーロー画像' },
  concept:    { icon: '💭', label: 'クリニックの想い' },
  features:   { icon: '⭐', label: '選ばれる理由' },
  services:   { icon: '🦷', label: '診療内容' },
  staff:      { icon: '👨‍⚕️', label: 'スタッフ紹介' },
  gallery:    { icon: '🖼️', label: 'ギャラリー' },
  contact:    { icon: '📍', label: 'アクセス・診療時間' },
  cta_banner: { icon: '📣', label: '予約CTAバー' },
  footer:     { icon: '📄', label: 'フッター' },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ic = 'w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent'
const ta = `${ic} resize-none`

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-600 mb-1">{children}</label>
}

// ─── Rich Text Editor ────────────────────────────────────────────────────────

const RTF_TOOLS = [
  { cmd: 'bold',          label: <strong>B</strong>, title: '太字' },
  { cmd: 'italic',        label: <em>I</em>,         title: '斜体' },
  { cmd: 'underline',     label: <u>U</u>,           title: '下線' },
  { cmd: 'strikeThrough', label: <s>S</s>,           title: '取消線' },
  { cmd: 'separator' },
  { cmd: 'removeFormat',  label: <span className="text-xs text-red-400">✕ 解除</span>, title: '書式解除' },
] satisfies { cmd: string; label?: React.ReactNode; title?: string }[]


function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editorRef   = useRef<HTMLDivElement>(null)
  const savedRange  = useRef<Range | null>(null)

  // Set initial HTML once
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = value || ''
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save selection whenever it changes — works even when drag ends outside editor
  useEffect(() => {
    function onSelectionChange() {
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) return
      const range = sel.getRangeAt(0)
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        savedRange.current = range.cloneRange()
      }
    }
    document.addEventListener('selectionchange', onSelectionChange)
    return () => document.removeEventListener('selectionchange', onSelectionChange)
  }, [])

  function saveSelection() {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange()
  }

  function restoreSelection() {
    const sel = window.getSelection()
    if (sel && savedRange.current) {
      sel.removeAllRanges()
      sel.addRange(savedRange.current)
    }
  }

  function applyFormatBlock(tag: string) {
    const editor = editorRef.current
    if (!editor) return
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    function editorChild(node: Node | null): Node | null {
      while (node && node.parentNode !== editor) node = node.parentNode
      return node
    }

    const range      = sel.getRangeAt(0)
    const startBlock = editorChild(range.startContainer)
    const endBlock   = editorChild(range.endContainer)

    const toConvert: Node[] = []
    let scanning = false
    for (const child of Array.from(editor.childNodes)) {
      if (child === startBlock) scanning = true
      if (scanning) toConvert.push(child)
      if (child === endBlock) break
    }
    if (toConvert.length === 0 && startBlock) toConvert.push(startBlock)

    for (const block of toConvert) {
      const newEl = document.createElement(tag)
      if (block.nodeType === Node.TEXT_NODE) {
        newEl.textContent = block.textContent
      } else {
        newEl.innerHTML = (block as HTMLElement).innerHTML
      }
      editor.replaceChild(newEl, block)
    }
  }

  function applyList(ordered: boolean) {
    const editor = editorRef.current
    if (!editor) return
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    function editorChild(node: Node | null): Node | null {
      while (node && node.parentNode !== editor) node = node.parentNode
      return node
    }

    const range      = sel.getRangeAt(0)
    const startBlock = editorChild(range.startContainer)
    const endBlock   = editorChild(range.endContainer)

    const toConvert: Node[] = []
    let scanning = false
    for (const child of Array.from(editor.childNodes)) {
      if (child === startBlock) scanning = true
      if (scanning) toConvert.push(child)
      if (child === endBlock) break
    }
    if (toConvert.length === 0 && startBlock) toConvert.push(startBlock)

    const list = document.createElement(ordered ? 'ol' : 'ul')
    list.style.paddingLeft = '1.5em'
    for (const block of toConvert) {
      const li = document.createElement('li')
      li.innerHTML = block.nodeType === Node.TEXT_NODE
        ? (block.textContent ?? '')
        : (block as HTMLElement).innerHTML
      list.appendChild(li)
    }
    // Replace all collected blocks with the single list element
    const first = toConvert[0]
    editor.insertBefore(list, first)
    for (const block of toConvert) editor.removeChild(block)
  }

  function exec(cmdStr: string) {
    if (cmdStr.startsWith('formatBlock:')) {
      const tag = cmdStr.slice('formatBlock:'.length).replace(/[<>]/g, '')
      applyFormatBlock(tag)
    } else if (cmdStr === 'insertUnorderedList') {
      applyList(false)
    } else if (cmdStr === 'insertOrderedList') {
      applyList(true)
    } else {
      restoreSelection()
      document.execCommand(cmdStr, false, undefined)
    }
    onChange(editorRef.current?.innerHTML || '')
  }


  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-cyan-400 focus-within:border-transparent">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        {RTF_TOOLS.map((tool, i) =>
          tool.cmd === 'separator'
            ? <div key={i} className="w-px h-4 bg-gray-300 mx-1" />
            : (
              <button
                key={tool.cmd}
                type="button"
                title={tool.title}
                onMouseDown={e => { e.preventDefault(); exec(tool.cmd) }}
                className="px-2 py-1 rounded hover:bg-gray-200 transition text-sm text-gray-700 leading-none"
              >
                {tool.label}
              </button>
            )
        )}
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || '')}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        className="px-3 py-2.5 text-sm text-gray-900 min-h-[120px] focus:outline-none prose prose-sm max-w-none"
      />
    </div>
  )
}

// ─── Icon Picker ─────────────────────────────────────────────────────────────

const ICON_CATEGORIES = [
  {
    label: '歯科・医療',
    icons: ['🦷', '🏥', '🩺', '🩻', '💉', '💊', '🔬', '🧬', '🩹', '🧪', '🫀', '🫁'],
  },
  {
    label: 'ケア・スタッフ',
    icons: ['👨‍⚕️', '👩‍⚕️', '🤝', '👥', '😊', '😁', '🙏', '💪', '🫶', '❤️', '💛', '💙'],
  },
  {
    label: '品質・信頼',
    icons: ['⭐', '🌟', '✨', '🏆', '🥇', '🎯', '💯', '✅', '☑️', '🔝', '💎', '🏅'],
  },
  {
    label: '安全・設備',
    icons: ['🛡️', '🔒', '⚙️', '🔧', '💡', '🖥️', '📱', '📡', '🔭', '🏗️', '🏢', '🚪'],
  },
  {
    label: '自然・温もり',
    icons: ['🌿', '🌸', '🌺', '🍃', '🌱', '🌾', '🌻', '🍀', '💚', '🌈', '☀️', '🌙'],
  },
  {
    label: 'スケジュール',
    icons: ['📅', '⏰', '🕐', '📆', '⌚', '🗓️', '⏱️', '🔔', '📢', '📣', '💬', '📞'],
  },
]

function IconPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (icon: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <Label>アイコン</Label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:border-cyan-400 transition text-left"
      >
        <span className="text-2xl leading-none">{value || '☐'}</span>
        <span className="text-xs text-gray-400 flex-1">クリックして選択</span>
        <svg className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl w-72 p-3 space-y-3">
          {ICON_CATEGORIES.map(cat => (
            <div key={cat.label}>
              <p className="text-xs font-bold text-gray-400 mb-1.5">{cat.label}</p>
              <div className="grid grid-cols-6 gap-1">
                {cat.icons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => { onChange(icon); setOpen(false) }}
                    className={[
                      'w-9 h-9 rounded-lg text-xl flex items-center justify-center hover:bg-cyan-50 transition',
                      value === icon ? 'bg-cyan-100 ring-2 ring-cyan-400' : '',
                    ].join(' ')}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {/* Custom input */}
          <div className="pt-1 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 mb-1">カスタム入力</p>
            <input
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="絵文字を直接入力"
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Compress image to max 900px wide, JPEG 0.72 quality — keeps base64 small enough for localStorage
function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 900
        const scale = Math.min(1, MAX / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.72))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

function UploadBtn({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (base64: string) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    onChange(compressed)
  }
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition"
        >
          📁 画像を選択
        </button>
        {value && (
          <div className="flex items-center gap-1.5">
            <img src={value} alt="" className="w-8 h-8 rounded object-cover border border-gray-200" />
            <button type="button" onClick={() => onChange('')} className="text-xs text-red-500 hover:underline">削除</button>
          </div>
        )}
        {!value && <span className="text-xs text-gray-400">未選択</span>}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

// ─── Edit forms per section type ─────────────────────────────────────────────

function EditForm({
  section,
  update,
  galleryCount = 6,
}: {
  section: PageSection
  update: (id: string, patch: Record<string, unknown>) => void
  galleryCount?: number
}) {
  const c = section.content
  const set = (key: string, value: unknown) => update(section.id, { [key]: value })

  switch (section.type) {
    case 'topbar':
      return (
        <div className="space-y-3">
          <div><Label>スクロールテキスト</Label><textarea rows={3} value={c.marqueeText || ''} onChange={e => set('marqueeText', e.target.value)} className={ta} /></div>
          <div><Label>スクロール速度（秒・大きいほど遅い）</Label>
            <input type="range" min={15} max={80} value={c.speed ?? 40} onChange={e => set('speed', Number(e.target.value))} className="w-full accent-cyan-600" />
            <span className="text-xs text-gray-400">{c.speed ?? 40}秒</span>
          </div>
        </div>
      )

    case 'header':
      return (
        <div className="space-y-3">
          <UploadBtn label="ロゴ画像" value={c.logoImageUrl || ''} onChange={v => set('logoImageUrl', v)} />
          <div><Label>クリニック名（テキストロゴ）</Label><input type="text" value={c.logoText || ''} onChange={e => set('logoText', e.target.value)} className={ic} /></div>
          <div><Label>電話番号</Label><input type="text" value={c.phone || ''} onChange={e => set('phone', e.target.value)} className={ic} /></div>
          <div>
            <Label>ナビゲーション（ラベル|リンク をカンマで区切る）</Label>
            <textarea rows={5} value={c.navItems || ''} onChange={e => set('navItems', e.target.value)} className={ta} placeholder={'診療案内|#concept\nスタッフ紹介|#staff\n施設案内|#gallery\nアクセス|#contact\nご予約|#cta_banner'} />
            <p className="text-xs text-gray-400 mt-1">例: <code className="bg-gray-100 px-1 rounded">診療案内|#concept</code> または外部リンク <code className="bg-gray-100 px-1 rounded">ご予約|https://...</code></p>
          </div>
        </div>
      )

    case 'hero':
      return (
        <div className="space-y-3">
          <UploadBtn label="背景画像" value={c.imageUrl || ''} onChange={v => set('imageUrl', v)} />
          <div>
            <Label>画像オーバーレイの暗さ（%）</Label>
            <input type="range" min={0} max={80} value={c.overlayOpacity ?? 45} onChange={e => set('overlayOpacity', Number(e.target.value))} className="w-full accent-cyan-600" />
            <span className="text-xs text-gray-400">{c.overlayOpacity ?? 45}%</span>
          </div>
          <div><Label>大見出し</Label><input type="text" value={c.title || ''} onChange={e => set('title', e.target.value)} className={ic} /></div>
          <div><Label>サブテキスト</Label><textarea rows={2} value={c.subtitle || ''} onChange={e => set('subtitle', e.target.value)} className={ta} /></div>
          <div><Label>ボタン①テキスト</Label><input type="text" value={c.ctaText || ''} onChange={e => set('ctaText', e.target.value)} className={ic} /></div>
          <div><Label>ボタン②テキスト</Label><input type="text" value={c.ctaText2 || ''} onChange={e => set('ctaText2', e.target.value)} className={ic} /></div>
        </div>
      )

    case 'concept':
      return (
        <div className="space-y-3">
          <div><Label>英語サブタイトル</Label><input type="text" value={c.subtitle || ''} onChange={e => set('subtitle', e.target.value)} className={ic} placeholder="Clinic Philosophy" /></div>
          <div><Label>見出し</Label><input type="text" value={c.title || ''} onChange={e => set('title', e.target.value)} className={ic} /></div>
          <div>
            <Label>本文</Label>
            <RichTextEditor value={c.body || ''} onChange={v => set('body', v)} />
          </div>
          <UploadBtn label="画像（任意）" value={c.imageUrl || ''} onChange={v => set('imageUrl', v)} />
        </div>
      )

    case 'features':
      return (
        <div className="space-y-3">
          <div><Label>見出し</Label><input type="text" value={c.title || ''} onChange={e => set('title', e.target.value)} className={ic} /></div>
          {(c.items || []).map((item: { icon?: string; title?: string; desc?: string }, i: number) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-bold text-gray-500">特徴 {i + 1}</p>
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-4">
                  <IconPicker
                    value={item.icon || ''}
                    onChange={v => { const items = [...c.items]; items[i] = { ...item, icon: v }; set('items', items) }}
                  />
                </div>
              </div>
              <div><Label>タイトル</Label><input type="text" value={item.title || ''} onChange={e => { const items = [...c.items]; items[i] = { ...item, title: e.target.value }; set('items', items) }} className={ic} /></div>
              <div>
                <Label>説明</Label>
                <RichTextEditor
                  value={item.desc || ''}
                  onChange={v => { const items = [...c.items]; items[i] = { ...item, desc: v }; set('items', items) }}
                />
              </div>
            </div>
          ))}
        </div>
      )

    case 'services':
      return (
        <div className="space-y-3">
          <div><Label>見出し</Label><input type="text" value={c.title || ''} onChange={e => set('title', e.target.value)} className={ic} /></div>
          <div><Label>診療項目（カンマ区切り）</Label><textarea rows={4} value={c.items || ''} onChange={e => set('items', e.target.value)} className={ta} placeholder="一般歯科,小児歯科,矯正歯科,インプラント" /></div>
        </div>
      )

    case 'staff':
      return (
        <div className="space-y-3">
          <div><Label>英語サブタイトル</Label><input type="text" value={c.subtitle || ''} onChange={e => set('subtitle', e.target.value)} className={ic} placeholder="Our Doctor" /></div>
          <div><Label>セクション見出し</Label><input type="text" value={c.title || ''} onChange={e => set('title', e.target.value)} className={ic} /></div>
          <UploadBtn label="プロフィール写真" value={c.staffImageUrl || ''} onChange={v => set('staffImageUrl', v)} />
          <div><Label>氏名</Label><input type="text" value={c.staffName || ''} onChange={e => set('staffName', e.target.value)} className={ic} /></div>
          <div><Label>役職</Label><input type="text" value={c.staffTitle || ''} onChange={e => set('staffTitle', e.target.value)} className={ic} placeholder="院長・歯科医師" /></div>
          <div><Label>資格・経歴</Label><input type="text" value={c.staffCredentials || ''} onChange={e => set('staffCredentials', e.target.value)} className={ic} /></div>
          <div>
            <Label>メッセージ</Label>
            <RichTextEditor value={c.staffMessage || ''} onChange={v => set('staffMessage', v)} />
          </div>
        </div>
      )

    case 'gallery':
      return (
        <div className="space-y-3">
          <div><Label>見出し</Label><input type="text" value={c.title || ''} onChange={e => set('title', e.target.value)} className={ic} /></div>
          <p className="text-xs text-gray-400">最大{galleryCount}枚アップロードできます</p>
          {(c.images || []).slice(0, galleryCount).map((url: string, i: number) => (
            <UploadBtn
              key={i}
              label={`写真 ${i + 1}`}
              value={url}
              onChange={v => { const imgs = [...c.images]; imgs[i] = v; set('images', imgs) }}
            />
          ))}
        </div>
      )

    case 'contact':
      return (
        <div className="space-y-3">
          <div><Label>見出し</Label><input type="text" value={c.title || ''} onChange={e => set('title', e.target.value)} className={ic} /></div>
          <div><Label>住所</Label><input type="text" value={c.address || ''} onChange={e => set('address', e.target.value)} className={ic} /></div>
          <div><Label>アクセス</Label><input type="text" value={c.access || ''} onChange={e => set('access', e.target.value)} className={ic} /></div>
          <div><Label>電話番号</Label><input type="text" value={c.phone || ''} onChange={e => set('phone', e.target.value)} className={ic} /></div>
          <div>
            <Label>診療時間（1行: 曜日|時間）</Label>
            <textarea rows={4} value={c.hours || ''} onChange={e => set('hours', e.target.value)} className={ta} placeholder={'月・火・木・金|9:00〜18:30\n水・土|9:00〜13:00\n日・祝|休診'} />
          </div>
        </div>
      )

    case 'cta_banner':
      return (
        <div className="space-y-3">
          <div><Label>見出し</Label><input type="text" value={c.title || ''} onChange={e => set('title', e.target.value)} className={ic} /></div>
          <div><Label>サブテキスト</Label><input type="text" value={c.subtitle || ''} onChange={e => set('subtitle', e.target.value)} className={ic} /></div>
          <div><Label>ボタンテキスト</Label><input type="text" value={c.ctaText || ''} onChange={e => set('ctaText', e.target.value)} className={ic} /></div>
          <div><Label>電話番号</Label><input type="text" value={c.phone || ''} onChange={e => set('phone', e.target.value)} className={ic} /></div>
        </div>
      )

    case 'footer':
      return (
        <div className="space-y-3">
          <div><Label>クリニック名</Label><input type="text" value={c.clinicName || ''} onChange={e => set('clinicName', e.target.value)} className={ic} /></div>
          <div><Label>住所</Label><input type="text" value={c.address || ''} onChange={e => set('address', e.target.value)} className={ic} /></div>
          <div><Label>電話番号</Label><input type="text" value={c.phone || ''} onChange={e => set('phone', e.target.value)} className={ic} /></div>
          <div><Label>診療時間（短縮版）</Label><input type="text" value={c.hours || ''} onChange={e => set('hours', e.target.value)} className={ic} /></div>
          <div><Label>コピーライト</Label><input type="text" value={c.copyright || ''} onChange={e => set('copyright', e.target.value)} className={ic} /></div>
        </div>
      )

    default:
      return <p className="text-xs text-gray-400">編集項目なし</p>
  }
}

// ─── Main Builder ─────────────────────────────────────────────────────────────

export default function LandingPageBuilder({ clinicName = '' }: { clinicName?: string }) {
  const [sections, setSections] = useState<PageSection[]>(() =>
    DEFAULT_SECTIONS.map(s =>
      s.type === 'header' && clinicName
        ? { ...s, content: { ...s.content, clinicName, logoText: clinicName } }
        : s
    )
  )
  const [templateId, setTemplateId] = useState<TemplateId>('modern')
  const [themeId, setThemeId] = useState<ThemeId>('clean')
  const [customTheme, setCustomTheme] = useState<Partial<LPTheme>>({})
  const [adminThemes, setAdminThemes] = useState<Record<string, LPTheme>>({})
  const [adminTemplates, setAdminTemplates] = useState<Record<string, FreeTemplate>>({})
  const [activeFreeTemplate, setActiveFreeTemplate] = useState<FreeTemplate | undefined>(undefined)

  // Which section types the active free template includes (null = show all)
  const templateSectionTypes = useMemo(() => {
    if (!activeFreeTemplate) return null
    const types = new Set(activeFreeTemplate.sections.map(s => s.sectionType).filter(Boolean) as string[])
    return types.size > 0 ? types : null
  }, [activeFreeTemplate])

  // How many gallery image slots the active free template uses
  const templateGalleryCount = useMemo(() => {
    if (!activeFreeTemplate) return 6
    const slots = new Set<string>()
    for (const sec of activeFreeTemplate.sections) {
      for (const col of sec.columns) {
        for (const block of col.blocks) {
          if (block.type === 'image-slot' && block.slot?.startsWith('gallery-')) {
            slots.add(block.slot)
          }
        }
      }
    }
    return slots.size > 0 ? slots.size : 6
  }, [activeFreeTemplate])

  const [showTemplateGallery, setShowTemplateGallery] = useState(false)
  const [showThemeGallery, setShowThemeGallery] = useState(false)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>('hero')
  const [previewMode, setPreviewMode] = useState(false)
  const [published, setPublished] = useState(false)
  const [slug, setSlug] = useState('smile-dental')
  const [copied, setCopied] = useState(false)

  // Drag-drop state
  const dragIdx = useRef<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const updateSection = useCallback((id: string, patch: Record<string, any>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, content: { ...s.content, ...patch } } : s))
  }, [])

  // Load admin-created themes and templates on mount
  useEffect(() => {
    loadAllThemes().then(setAdminThemes).catch(() => {})
    loadAllTemplates().then(setAdminTemplates).catch(() => {})
  }, [])

  // Keep built-in and admin themes separate — admin IDs never overwrite built-ins
  const allThemes = { ...THEMES, ...Object.fromEntries(
    Object.entries(adminThemes).filter(([id]) => !(id in THEMES))
  ) }

  const toggleVisible = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s))
  }

  function onDragStart(i: number) { dragIdx.current = i }
  function onDragOver(e: React.DragEvent, i: number) { e.preventDefault(); setDragOverIdx(i) }
  function onDrop(i: number) {
    if (dragIdx.current === null) return
    const next = [...sections]
    const [moved] = next.splice(dragIdx.current, 1)
    next.splice(i, 0, moved)
    setSections(next)
    dragIdx.current = null
    setDragOverIdx(null)
  }
  function onDragEnd() { dragIdx.current = null; setDragOverIdx(null) }

  const [publishError, setPublishError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)

  async function handlePublish() {
    if (publishing) return
    setPublishError(null)
    setPublishing(true)
    try {
      await lpSave(slug, { sections, templateId, themeId, customTheme })
      setPublished(true)
    } catch {
      setPublishError('保存に失敗しました。ページを再読み込みして再度お試しください。')
    } finally {
      setPublishing(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(`${window.location.origin}/clinics/${slug}`).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Published screen
  if (published) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 p-8">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">🎉</div>
        <h2 className="text-xl font-bold text-gray-900">採用ページを公開しました！</h2>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-full max-w-md">
          <span className="text-sm text-cyan-700 font-mono flex-1 truncate">{typeof window !== 'undefined' ? window.location.origin : ''}/clinics/{slug}</span>
          <button onClick={handleCopy} className="shrink-0 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 px-3 py-1.5 rounded-lg transition">
            {copied ? '✓ コピー済み' : 'コピー'}
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setPublished(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            編集に戻る
          </button>
          <button
            type="button"
            onClick={() => window.open(`/clinics/${slug}`, '_blank')}
            className="px-5 py-2.5 text-sm font-bold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition shadow-sm">
            ページを見る →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* ── Toolbar ── */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 flex-wrap">
        {/* Template selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplateGallery(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            🖼 {TEMPLATES[templateId]?.nameJa ?? templateId}
            <span className="text-gray-400">▾</span>
          </button>
        </div>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        {/* Theme selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowThemeGallery(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: THEMES[themeId]?.accent }} />
            {THEMES[themeId]?.nameJa ?? themeId}
            <span className="text-gray-400">▾</span>
          </button>
          <button
            onClick={() => setShowCustomizer(v => !v)}
            className={['px-3 py-1.5 text-xs font-semibold border rounded-lg transition', showCustomizer ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'].join(' ')}
          >
            🎨 カスタマイズ
          </button>
        </div>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        {/* Preview toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
          <button onClick={() => setPreviewMode(false)} className={['px-3 py-1.5 transition', !previewMode ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:bg-gray-50'].join(' ')}>
            🖊 編集
          </button>
          <button onClick={() => setPreviewMode(true)} className={['px-3 py-1.5 transition', previewMode ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:bg-gray-50'].join(' ')}>
            👁 プレビュー
          </button>
        </div>

        <div className="flex-1" />

        {/* Publish */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden text-sm">
            <span className="px-2.5 py-2 text-xs text-gray-400 bg-gray-50">/clinics/</span>
            <input
              type="text"
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="w-32 px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
              placeholder="your-clinic"
            />
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-4 py-2 text-sm font-bold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {publishing ? '保存中...' : '🚀 公開する'}
            </button>
            {publishError && (
              <p className="text-xs text-red-500 max-w-xs text-right">{publishError}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left: section list ── (hidden in preview mode) */}
        {!previewMode && (
          <div className="w-72 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">セクション（ドラッグで並替）</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sections.map((section, i) => {
                if (templateSectionTypes && !templateSectionTypes.has(section.type)) return null
                const meta = SECTION_META[section.type] ?? { icon: '📦', label: section.type }
                const isExpanded = expandedId === section.id
                const isDragOver = dragOverIdx === i

                return (
                  <div
                    key={section.id}
                    className={['border-b border-gray-100 transition-all', isDragOver ? 'border-t-2 border-t-cyan-400' : ''].join(' ')}
                    draggable
                    onDragStart={() => onDragStart(i)}
                    onDragOver={e => onDragOver(e, i)}
                    onDrop={() => onDrop(i)}
                    onDragEnd={onDragEnd}
                  >
                    {/* Section row */}
                    <div
                      className={['flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition group', isExpanded ? 'bg-cyan-50' : ''].join(' ')}
                      onClick={() => setExpandedId(isExpanded ? null : section.id)}
                    >
                      {/* Drag handle */}
                      <span className="text-gray-300 group-hover:text-gray-400 cursor-grab select-none text-base shrink-0">⠿</span>
                      <span className="text-base shrink-0">{meta.icon}</span>
                      <span className={['flex-1 text-xs font-semibold truncate', isExpanded ? 'text-cyan-700' : 'text-gray-700'].join(' ')}>
                        {meta.label}
                      </span>
                      {/* Visibility toggle */}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); toggleVisible(section.id) }}
                        title={section.visible ? '非表示にする' : '表示する'}
                        className="shrink-0 text-sm opacity-50 hover:opacity-100 transition"
                      >
                        {section.visible ? '👁' : '🙈'}
                      </button>
                      {/* Expand arrow */}
                      <svg className={`w-3 h-3 text-gray-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>

                    {/* Expanded edit form */}
                    {isExpanded && (
                      <div className="px-3 pb-4 pt-2 bg-cyan-50/50 border-t border-cyan-100">
                        <EditForm section={section} update={updateSection} galleryCount={templateGalleryCount} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Right: live preview ── */}
        <div className="flex-1 overflow-auto bg-gray-100">
          {previewMode ? (
            /* Full preview */
            <div className="bg-white min-h-full">
              <LandingPageRenderer sections={sections} templateId={templateId} themeId={themeId} customTheme={customTheme} extraThemes={adminThemes} freeTemplate={activeFreeTemplate} />
            </div>
          ) : (
            /* Editor preview in a browser frame */
            <div className="p-4">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 font-mono">
                    {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/clinics/{slug || 'your-clinic'}
                  </div>
                </div>
                {/* Page content */}
                <LandingPageRenderer sections={sections} templateId={templateId} themeId={themeId} customTheme={customTheme} extraThemes={adminThemes} freeTemplate={activeFreeTemplate} />
              </div>
            </div>
          )}
        </div>

        {/* ── Customizer panel ── */}
        {showCustomizer && (
          <div className="w-72 shrink-0 border-l border-gray-200 bg-white overflow-y-auto flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800">🎨 テーマのカスタマイズ</span>
              <button onClick={() => setShowCustomizer(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
            <div className="p-4 space-y-5 flex-1">
              {/* Base theme indicator */}
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                ベーステーマ: <strong>{THEMES[themeId]?.nameJa}</strong>
              </div>

              {([
                { key: 'accent',        label: 'アクセントカラー',   hint: 'ボタン・リンク・見出しに使用' },
                { key: 'topbarBg',      label: 'お知らせバー背景色',  hint: '' },
                { key: 'headerBg',      label: 'ヘッダー背景色',      hint: '' },
                { key: 'footerBg',      label: 'フッター背景色',      hint: '' },
                { key: 'sectionAltBg',  label: 'セクション背景色',    hint: '交互背景' },
                { key: 'cardBg',        label: 'カード背景色',        hint: '' },
              ] as { key: keyof LPTheme; label: string; hint: string }[]).map(({ key, label, hint }) => {
                const base = THEMES[themeId]?.[key] as string ?? '#ffffff'
                const current = (customTheme[key] as string) ?? base
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-700">{label}</label>
                      {customTheme[key] && (
                        <button
                          onClick={() => setCustomTheme(p => { const n = { ...p }; delete n[key]; return n })}
                          className="text-xs text-cyan-600 hover:underline"
                        >リセット</button>
                      )}
                    </div>
                    {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={current.startsWith('#') ? current : base}
                        onChange={e => setCustomTheme(p => ({ ...p, [key]: e.target.value }))}
                        className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                      />
                      <span className="text-xs font-mono text-gray-500">{current}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setCustomTheme({})}
                className="w-full py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
              >
                すべてリセット
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Template Gallery Modal ── */}
      {showTemplateGallery && (
        <div className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-6" onClick={() => setShowTemplateGallery(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-base font-bold text-gray-900">レイアウトを選択</h2>
                <p className="text-xs text-gray-500 mt-0.5">テーマカラーは別途変更できます。</p>
              </div>
              <button onClick={() => setShowTemplateGallery(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            {/* Built-in templates */}
            <div className="px-6 pt-4 pb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">標準テンプレート</p>
              <div className="grid grid-cols-3 gap-4">
                {(Object.entries(TEMPLATES) as [TemplateId, typeof TEMPLATES[TemplateId]][]).map(([id, tmpl]) => {
                  const isActive = templateId === id
                  return (
                    <button
                      key={id}
                      onClick={() => { setTemplateId(id); setActiveFreeTemplate(undefined); setShowTemplateGallery(false) }}
                      className={['rounded-xl overflow-hidden border-2 transition text-left hover:shadow-md', isActive ? 'border-cyan-500 shadow-md' : 'border-gray-200 hover:border-gray-300'].join(' ')}
                    >
                      <div className="bg-gray-50 p-3 space-y-1.5 h-36 flex flex-col justify-center">
                        {id === 'modern' && (
                          <>
                            <div className="h-2 rounded bg-gray-300 w-full" />
                            <div className="h-8 rounded bg-gray-200 w-full" />
                            <div className="flex gap-1">
                              {[1,2,3].map(i => <div key={i} className="flex-1 h-5 rounded bg-gray-200" />)}
                            </div>
                            <div className="h-3 rounded bg-gray-300 w-3/4" />
                          </>
                        )}
                        {id === 'professional' && (
                          <>
                            <div className="h-2 rounded bg-gray-300 w-full" />
                            <div className="flex gap-1 h-10">
                              <div className="flex-1 rounded bg-cyan-200" />
                              <div className="flex-1 rounded bg-gray-200" />
                            </div>
                            <div className="space-y-1">
                              {[1,2,3].map(i => <div key={i} className="flex gap-1 items-center"><div className="w-5 h-1.5 rounded bg-cyan-300" /><div className="flex-1 h-1.5 rounded bg-gray-200" /></div>)}
                            </div>
                          </>
                        )}
                        {id === 'boutique' && (
                          <>
                            <div className="flex items-center gap-1"><div className="flex-1 h-px bg-gray-300" /><div className="w-16 h-2 rounded bg-gray-300" /><div className="flex-1 h-px bg-gray-300" /></div>
                            <div className="flex gap-2 items-center">
                              <div className="flex-1 space-y-1"><div className="h-2 rounded bg-gray-300 w-3/4" /><div className="h-1.5 rounded bg-gray-200 w-full" /></div>
                              <div className="w-12 h-12 rounded-full bg-gray-200" />
                            </div>
                            <div className="space-y-1">
                              {[1,2].map(i => <div key={i} className="h-4 rounded-lg bg-white border-l-2 border-cyan-400 pl-1 flex items-center"><div className="w-full h-1 rounded bg-gray-200" /></div>)}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="px-3 py-3 bg-white">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-bold text-gray-800">{tmpl.nameJa}</span>
                          {isActive && <span className="text-xs text-cyan-600 font-semibold">✓ 選択中</span>}
                        </div>
                        <p className="text-xs text-gray-400">{tmpl.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Admin-created free templates */}
            {Object.keys(adminTemplates).length > 0 && (
              <div className="px-6 pt-2 pb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">カスタムテンプレート</p>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(adminTemplates).map(([id, tmpl]) => {
                    const isActive = templateId === id
                    return (
                      <button
                        key={id}
                        onClick={() => { setTemplateId(id as TemplateId); setActiveFreeTemplate(tmpl); setShowTemplateGallery(false) }}
                        className={['rounded-xl overflow-hidden border-2 transition text-left hover:shadow-md', isActive ? 'border-cyan-500 shadow-md' : 'border-gray-200 hover:border-gray-300'].join(' ')}
                      >
                        {/* Generic free-template preview */}
                        <div className="bg-gray-50 p-3 h-36 flex flex-col justify-center gap-2">
                          {tmpl.sections.slice(0, 3).map((s, i) => (
                            <div key={s.id} className="flex gap-1" style={{ opacity: 1 - i * 0.25 }}>
                              {s.columns.map((col) => (
                                <div key={col.id} className="flex-1 h-4 rounded bg-gray-200" />
                              ))}
                            </div>
                          ))}
                          {tmpl.sections.length === 0 && (
                            <div className="text-center text-[10px] text-gray-400">空のテンプレート</div>
                          )}
                        </div>
                        <div className="px-3 py-3 bg-white">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-sm font-bold text-gray-800">{tmpl.nameJa}</span>
                            {isActive && <span className="text-xs text-cyan-600 font-semibold">✓ 選択中</span>}
                          </div>
                          <p className="text-xs text-gray-400">{tmpl.desc || `${tmpl.sections.length} セクション`}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Theme Gallery Modal ── */}
      {showThemeGallery && (
        <div className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-6" onClick={() => setShowThemeGallery(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">テーマを選択</h2>
                <p className="text-xs text-gray-500 mt-0.5">テーマを選んだあと「カスタマイズ」で色を調整できます</p>
              </div>
              <button onClick={() => setShowThemeGallery(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-6 grid grid-cols-4 gap-3">
              {Object.entries(allThemes).map(([id, theme]) => {
                const isActive = themeId === id
                return (
                  <button
                    key={id}
                    onClick={() => { setThemeId(id as ThemeId); setCustomTheme({}); setShowThemeGallery(false) }}
                    className={['rounded-xl overflow-hidden border-2 transition text-left hover:shadow-md flex flex-col', isActive ? 'border-cyan-500 shadow-md' : 'border-gray-200 hover:border-gray-300'].join(' ')}
                  >
                    {/* Color preview strip */}
                    <div className="flex h-7 shrink-0">
                      <div className="flex-1" style={{ background: theme.topbarBg }} />
                      <div className="flex-1" style={{ background: theme.headerBg }} />
                      <div className="flex-1" style={{ background: theme.accent }} />
                      <div className="flex-1" style={{ background: theme.footerBg }} />
                    </div>
                    {/* Card section - fixed height */}
                    <div className="px-2.5 py-2 flex-1" style={{ background: theme.sectionAltBg }}>
                      <div className="flex items-center gap-1 mb-1.5">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: theme.cardIconBg, border: `2px solid ${theme.accent}` }} />
                        <div className="h-1.5 rounded flex-1" style={{ background: theme.accent, opacity: 0.5 }} />
                      </div>
                      <div className="h-1.5 rounded w-3/4 mb-1" style={{ background: theme.dividerColor }} />
                      <div className="h-1.5 rounded w-1/2" style={{ background: theme.dividerColor }} />
                    </div>
                    {/* Name bar */}
                    <div className="px-2.5 py-1.5 flex items-center justify-between shrink-0" style={{ background: theme.cardBg }}>
                      <span className="text-xs font-bold truncate" style={{ color: theme.accent }}>{theme.nameJa}</span>
                      {isActive && <span className="text-xs text-cyan-600 shrink-0 ml-1">✓</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
