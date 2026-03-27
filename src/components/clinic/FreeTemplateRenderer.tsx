'use client'

import type { LPTheme, PageSection } from './LandingPageRenderer'
import type { Block, FontChoice, FreeTemplate, ImageSlot, TemplateSection } from '@/lib/templateStorage'

// ── Variable + image resolution ───────────────────────────────────────────────

function buildVarMap(sections: PageSection[]): Record<string, string> {
  const m: Record<string, string> = {}
  for (const s of sections) {
    const c = s.content
    if (s.type === 'header') {
      m['clinicName'] = c.logoText ?? c.clinicName ?? ''
      m['headerPhone'] = c.phone ?? ''
    }
    if (s.type === 'topbar') {
      m['tagline'] = c.marqueeText ?? c.text ?? ''
      m['scrollSpeed'] = String(Math.max(10, c.speed ?? 40))
    }
    if (s.type === 'hero') {
      m['heroTitle']    = c.title    ?? ''
      m['heroSubtitle'] = c.subtitle ?? ''
      m['ctaText']      = c.ctaText  ?? ''
      m['ctaText2']     = c.ctaText2 ?? ''
    }
    if (s.type === 'concept') {
      m['conceptSubtitle'] = c.subtitle ?? ''
      m['conceptTitle']    = c.title    ?? ''
      m['conceptBody']     = c.body     ?? ''
    }
    if (s.type === 'features') {
      m['featuresTitle'] = c.title ?? ''
    }
    if (s.type === 'services') {
      m['servicesTitle'] = c.title ?? ''
      m['servicesItems'] = c.items ?? ''
    }
    if (s.type === 'staff') {
      m['staffSectionSubtitle'] = c.subtitle         ?? ''
      m['staffSectionTitle']    = c.title            ?? ''
      m['staffName']            = c.staffName        ?? ''
      m['staffTitle']           = c.staffTitle       ?? ''
      m['staffCredentials']     = c.staffCredentials ?? ''
      m['staffMessage']         = c.staffMessage     ?? ''
    }
    if (s.type === 'gallery') {
      m['galleryTitle'] = c.title ?? ''
    }
    if (s.type === 'contact') {
      m['contactTitle'] = c.title   ?? ''
      m['address']      = c.address ?? ''
      m['access']       = c.access  ?? ''
      m['phone']        = c.phone   ?? ''
      m['hours']        = c.hours   ?? ''
    }
    if (s.type === 'cta_banner') {
      m['ctaBannerTitle']    = c.title    ?? ''
      m['ctaBannerSubtitle'] = c.subtitle ?? ''
      m['ctaBannerCta']      = c.ctaText  ?? ''
      m['ctaBannerPhone']    = c.phone    ?? ''
    }
    if (s.type === 'footer') {
      m['footerClinicName'] = c.clinicName ?? ''
      m['footerAddress']    = c.address   ?? ''
      m['footerPhone']      = c.phone     ?? ''
      m['footerHours']      = c.hours     ?? ''
      m['footerCopyright']  = c.copyright ?? ''
    }
  }
  return m
}

function buildImageMap(sections: PageSection[]): Record<string, string> {
  const m: Record<string, string> = {}
  for (const s of sections) {
    const c = s.content
    if (s.type === 'hero')    m['hero']    = c.imageUrl      ?? ''
    if (s.type === 'staff')   m['staff']   = c.staffImageUrl ?? ''
    if (s.type === 'concept') m['concept'] = c.imageUrl      ?? ''
    if (s.type === 'gallery') {
      const imgs = Array.isArray(c.images) ? c.images : []
      imgs.forEach((u: string, i: number) => { m[`gallery-${i + 1}`] = u })
    }
  }
  return m
}

function interpolate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`)
}

// ── Block renderer ────────────────────────────────────────────────────────────

const SIZE_CLASS: Record<string, string> = {
  sm: 'text-sm', base: 'text-base', lg: 'text-lg',
  xl: 'text-xl', '2xl': 'text-2xl', '3xl': 'text-3xl', '4xl': 'text-4xl',
}
const WEIGHT_CLASS: Record<string, string> = {
  normal: 'font-normal', semibold: 'font-semibold', bold: 'font-bold', black: 'font-black',
}
const ALIGN_CLASS: Record<string, string> = {
  left: 'text-left', center: 'text-center', right: 'text-right',
}

function blockColor(color: string | undefined, t: LPTheme): string {
  if (color === 'accent')  return t.accent
  if (color === 'muted')   return '#94a3b8'
  if (color === 'white')   return '#ffffff'
  return 'inherit'
}

function BlockRender({
  block, vars, images, t, showPlaceholders = false,
}: {
  block: Block
  vars:  Record<string, string>
  images: Record<string, string>
  t: LPTheme
  showPlaceholders?: boolean
}) {
  const align  = ALIGN_CLASS[block.align ?? 'left']
  const size   = SIZE_CLASS[block.size   ?? 'base']
  const weight = WEIGHT_CLASS[block.weight ?? 'normal']
  const color  = blockColor(block.color, t)
  const text   = interpolate(block.text ?? '', vars)

  if (block.type === 'image-slot') {
    const src    = images[block.slot ?? 'hero']
    const h      = block.imgHeight ?? 240
    const radius = block.imgShape === 'circle'
      ? '50%'
      : block.imgShape === 'rounded'
      ? '16px'
      : '0px'
    if (src) return (
      <img
        src={src} alt=""
        className="w-full object-cover"
        style={{ height: h, borderRadius: radius }}
      />
    )
    if (showPlaceholders) return (
      <div
        className="w-full flex items-center justify-center text-sm text-gray-400"
        style={{ height: h, background: t.sectionAltBg, borderRadius: radius, border: `2px dashed ${t.dividerColor}` }}
      >
        画像なし
      </div>
    )
    return null
  }

  if (block.type === 'heading') {
    return (
      <p className={[size, weight, align, 'leading-tight'].join(' ')} style={{ color }}>
        {text || 'タイトル'}
      </p>
    )
  }

  if (block.type === 'paragraph') {
    return (
      <p className={[size, align, 'leading-relaxed whitespace-pre-line'].join(' ')} style={{ color }}>
        {text || '本文テキスト'}
      </p>
    )
  }

  if (block.type === 'button') {
    const style = block.btnStyle ?? 'filled'
    const base  = 'inline-block px-6 py-2.5 font-bold rounded-full cursor-default text-sm'
    const s = style === 'filled'
      ? { background: t.heroBtnBg, color: t.heroBtnText }
      : style === 'outlined'
      ? { background: 'transparent', color: t.accent, border: `2px solid ${t.accent}` }
      : { background: 'transparent', color: t.accent }
    return (
      <div className={align}>
        <span className={base} style={s}>{text || 'ボタン'}</span>
      </div>
    )
  }

  if (block.type === 'divider') {
    return <hr style={{ border: 'none', borderTop: `1px solid ${t.dividerColor}`, margin: '8px 0' }} />
  }

  if (block.type === 'spacer') {
    return <div style={{ height: block.height ?? 24 }} />
  }

  return null
}

// ── Column grid mapping ───────────────────────────────────────────────────────

function colStyle(layout: string): React.CSSProperties {
  const map: Record<string, string> = {
    '1':   '1fr',
    '2':   '1fr 1fr',
    '3':   '1fr 1fr 1fr',
    '2+1': '2fr 1fr',
    '1+2': '1fr 2fr',
  }
  return { display: 'grid', gridTemplateColumns: map[layout] ?? '1fr', gap: '24px' }
}

const PY_MAP: Record<string, string> = {
  sm: '24px', md: '48px', lg: '80px', xl: '120px',
}

// ── Section renderer ──────────────────────────────────────────────────────────

function SectionRender({
  section, vars, images, t, showPlaceholders,
}: {
  section: TemplateSection
  vars:    Record<string, string>
  images:  Record<string, string>
  t: LPTheme
  showPlaceholders: boolean
}) {
  // Section-type-aware background: named sections use their dedicated theme colours
  let bg = '#ffffff'
  if      (section.sectionType === 'topbar')                      bg = t.topbarBg
  else if (section.sectionType === 'header')                      bg = t.headerBg
  else if (section.sectionType === 'footer')                      bg = t.footerBg
  else if (section.bg === 'alt')                                  bg = t.sectionAltBg
  else if (section.bg === 'accent')                               bg = t.accent
  else if (section.bg === 'dark')                                 bg = t.footerBg

  // Topbar: render as scrolling marquee using clinic's marqueeText + speed
  if (section.sectionType === 'topbar') {
    const text     = vars['tagline'] || '新患受付中 | お気軽にご連絡ください'
    const duration = vars['scrollSpeed'] || '40'
    return (
      <div className="overflow-hidden py-2 text-sm font-medium" style={{ background: bg, color: t.topbarText }}>
        <style>{`@keyframes lp-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
        <div className="inline-flex" style={{ whiteSpace: 'nowrap', animation: `lp-scroll ${duration}s linear infinite` }}>
          {[0, 1, 2, 3].map(i => <span key={i} className="px-10">{text}</span>)}
        </div>
      </div>
    )
  }

  if (section.sectionType === 'gallery') {
    const galleryImgs = Object.entries(images)
      .filter(([k]) => k.startsWith('gallery-'))
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
      .map(([, v]) => v)
      .filter(Boolean)
    if (galleryImgs.length === 0) return null
    const gridClass =
      galleryImgs.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' :
      galleryImgs.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' :
      galleryImgs.length === 4 ? 'grid-cols-2 md:grid-cols-2' :
      'grid-cols-2 md:grid-cols-3'
    const hasFeature = galleryImgs.length === 3 || galleryImgs.length === 5
    return (
      <div className="py-20 px-6" style={{ background: bg }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: t.accent }}>Gallery</p>
            <h2 className="text-3xl font-bold text-gray-900">{vars['galleryTitle'] || '院内のご案内'}</h2>
          </div>
          <div className={`grid ${gridClass} gap-4`}>
            {galleryImgs.map((url, i) => (
              <div
                key={i}
                className={['rounded-xl overflow-hidden shadow-sm', hasFeature && i === 0 ? 'col-span-2 aspect-[16/7]' : 'aspect-video'].join(' ')}
              >
                <img src={url} alt={`gallery-${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const py = PY_MAP[section.py] ?? '48px'

  return (
    <section style={{ background: bg, paddingTop: py, paddingBottom: py }}>
      <div className="max-w-5xl mx-auto px-6" style={colStyle(section.layout)}>
        {section.columns.map(col => (
          <div key={col.id} className="flex flex-col gap-4">
            {col.blocks.map(block => (
              <BlockRender key={block.id} block={block} vars={vars} images={images} t={t} showPlaceholders={showPlaceholders} />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Font map ──────────────────────────────────────────────────────────────────

const FONT_CSS: Record<FontChoice, string> = {
  'noto-sans':     'var(--font-noto-sans-jp), sans-serif',
  'sans':          'var(--font-noto-sans-jp), sans-serif',
  'noto-serif':    'var(--font-noto-serif-jp), serif',
  'serif':         'var(--font-noto-serif-jp), serif',
  'mplus-rounded': 'var(--font-mplus-rounded), sans-serif',
  'biz-ud':        'var(--font-biz-ud), sans-serif',
  'zen-gothic':    'var(--font-zen-gothic), sans-serif',
  'shippori':      'var(--font-shippori), serif',
}

// ── Main export ───────────────────────────────────────────────────────────────

export function FreeTemplateRenderer({
  template, sections, t, showPlaceholders = false,
}: {
  template: FreeTemplate
  sections: PageSection[]
  t: LPTheme
  showPlaceholders?: boolean
}) {
  const vars   = buildVarMap(sections)
  const images = buildImageMap(sections)
  const font   = FONT_CSS[template.fontFamily] ?? FONT_CSS['noto-sans']

  // Build a set of hidden section types from the clinic's sections array
  const hiddenTypes = new Set(sections.filter(s => !s.visible).map(s => s.type))

  return (
    <div style={{ fontFamily: font }}>
      {template.sections
        .filter(section => !section.sectionType || !hiddenTypes.has(section.sectionType))
        .map(section => (
          <SectionRender key={section.id} section={section} vars={vars} images={images} t={t} showPlaceholders={showPlaceholders} />
        ))}
    </div>
  )
}
