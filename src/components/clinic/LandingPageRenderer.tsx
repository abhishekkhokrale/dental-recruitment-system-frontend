'use client'

import { Template2Renderer } from './LandingPageTemplate2'
import { Template3Renderer } from './LandingPageTemplate3'
import { FreeTemplateRenderer } from './FreeTemplateRenderer'
import type { FreeTemplate } from '@/lib/templateStorage'

// ─── Types ──────────────────────────────────────────────────────────────────

export type TemplateId = 'modern' | 'professional' | 'boutique'

export const TEMPLATES: Record<TemplateId, { nameJa: string; desc: string; preview: { hero: string; feature: string; staff: string } }> = {
  modern:       { nameJa: 'モダン',             desc: 'カード型・シンプルモダン',       preview: { hero: 'フルワイドヒーロー', feature: 'アイコンカード3列', staff: '中央カード' } },
  professional: { nameJa: 'プロフェッショナル', desc: 'スプリット画面・コーポレート',   preview: { hero: '左テキスト+右画像', feature: '番号付き縦型', staff: '横長カード' } },
  boutique:     { nameJa: 'ブティック',         desc: '有機的・温かみある曲線デザイン', preview: { hero: '有機形状フレーム', feature: '左ボーダーカード', staff: '円形写真' } },
}

export interface PageSection {
  id: string
  type: string
  visible: boolean
  content: Record<string, any>
}

export interface LPTheme {
  nameJa: string
  topbarBg: string
  topbarText: string
  headerBg: string
  headerText: string
  headerBorder: string
  logoColor: string
  accent: string
  accentLight: string
  accentText: string
  heroBtnBg: string
  heroBtnText: string
  heroBtn2Border: string
  sectionAltBg: string
  cardBg: string
  cardIconBg: string
  dividerColor: string
  footerBg: string
  footerText: string
  footerBorder: string
  badgeBg: string
  badgeText: string
}

export type ThemeId = string

// ─── Default sections ────────────────────────────────────────────────────────

export const DEFAULT_SECTIONS: PageSection[] = [
  {
    id: 'topbar', type: 'topbar', visible: true,
    content: {
      marqueeText: '🦷 新患受付中｜初診の方はお気軽にお電話ください　📞 03-0000-0000　｜　月〜土 9:00〜18:00 診療受付中　｜　LINE予約も受け付けております 🌿',
      speed: 40,
    },
  },
  {
    id: 'header', type: 'header', visible: true,
    content: {
      logoText: 'スマイル歯科クリニック',
      logoImageUrl: '',
      phone: '03-0000-0000',
      navItems: '診療案内|#concept,スタッフ紹介|#staff,施設案内|#gallery,アクセス|#contact,ご予約|#cta_banner',
    },
  },
  {
    id: 'hero', type: 'hero', visible: true,
    content: {
      imageUrl: '',
      overlayOpacity: 45,
      title: '患者さまの笑顔のために',
      subtitle: 'あなたの歯と向き合い、生涯にわたる口腔の健康をサポートします',
      ctaText: 'Web予約はこちら',
      ctaText2: '診療案内を見る',
    },
  },
  {
    id: 'concept', type: 'concept', visible: true,
    content: {
      subtitle: 'Clinic Philosophy',
      title: 'クリニックの想い',
      body: '私たちは「治療する」だけでなく、「予防する」ことを大切にしています。患者さま一人ひとりのお口の状態を丁寧に診察し、最適な治療プランをご提案します。最先端の医療技術と温かいコミュニケーションで、あなたのかかりつけ歯科医を目指します。',
      imageUrl: '',
    },
  },
  {
    id: 'features', type: 'features', visible: true,
    content: {
      title: '選ばれる4つの理由',
      items: [
        { icon: '🔬', title: '最新医療設備', desc: 'CT・レーザーなど最先端の医療機器を導入。精度の高い診断と治療を提供します。' },
        { icon: '🤝', title: '丁寧なカウンセリング', desc: '治療前に十分な説明を行い、患者さまが納得された上で治療を進めます。' },
        { icon: '🛡️', title: '徹底した衛生管理', desc: '器具の滅菌・消毒を徹底し、安心・安全な環境で治療をご提供します。' },
        { icon: '🌱', title: '予防歯科の充実', desc: '定期検診・クリーニングで虫歯・歯周病を予防。健康な歯を長く保ちます。' },
      ],
    },
  },
  {
    id: 'services', type: 'services', visible: true,
    content: {
      title: '診療内容',
      items: '一般歯科,小児歯科,矯正歯科,インプラント,審美歯科,ホワイトニング,入れ歯・義歯,歯周病治療,口腔外科,スポーツマウスガード,予防歯科・クリーニング,知覚過敏治療,顎関節症治療,いびき治療,セラミック治療',
    },
  },
  {
    id: 'staff', type: 'staff', visible: true,
    content: {
      subtitle: 'Our Doctor',
      title: '院長・スタッフ紹介',
      staffName: '田中 誠',
      staffTitle: '院長・歯科医師',
      staffCredentials: '東京歯科大学卒業｜歯学博士｜日本歯科保存学会認定医',
      staffMessage: 'お口の健康は全身の健康につながります。患者さまが「この歯科に来てよかった」と感じていただけるよう、スタッフ一同誠心誠意対応いたします。どんな小さなことでもお気軽にご相談ください。',
      staffImageUrl: '',
    },
  },
  {
    id: 'gallery', type: 'gallery', visible: true,
    content: {
      title: '院内のご案内',
      images: ['', '', '', '', '', ''],
    },
  },
  {
    id: 'contact', type: 'contact', visible: true,
    content: {
      title: 'アクセス・診療時間',
      address: '東京都渋谷区〇〇町1-2-3 〇〇ビル2F',
      access: '渋谷駅東口より徒歩5分、代官山駅より徒歩7分',
      phone: '03-0000-0000',
      hours: '月・火・木・金|9:00〜13:00 / 15:00〜18:30\n水・土|9:00〜13:00\n日・祝|休診',
    },
  },
  {
    id: 'cta_banner', type: 'cta_banner', visible: true,
    content: {
      title: 'まずはお気軽にご相談ください',
      subtitle: 'お電話・Webからご予約いただけます。初診の方も歓迎しております。',
      ctaText: 'Web予約する',
      phone: '03-0000-0000',
    },
  },
  {
    id: 'footer', type: 'footer', visible: true,
    content: {
      clinicName: 'スマイル歯科クリニック',
      address: '東京都渋谷区〇〇町1-2-3 〇〇ビル2F',
      phone: '03-0000-0000',
      hours: '月〜金 9:00〜18:30 / 土 9:00〜13:00',
      copyright: '© 2024 スマイル歯科クリニック All Rights Reserved.',
    },
  },
]

// ─── Section Renderers ───────────────────────────────────────────────────────

type SP = { c: Record<string, any>; t: LPTheme }

function TopBarSection({ c, t }: SP) {
  const text = c.marqueeText || '新患受付中 | お気軽にご連絡ください'
  const duration = Math.max(10, c.speed ?? 40)
  return (
    <div className="overflow-hidden py-2 text-sm font-medium" style={{ background: t.topbarBg, color: t.topbarText }}>
      <style>{`@keyframes lp-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      <div className="inline-flex" style={{ whiteSpace: 'nowrap', animation: `lp-scroll ${duration}s linear infinite` }}>
        {[0, 1, 2, 3].map(i => <span key={i} className="px-10">{text}</span>)}
      </div>
    </div>
  )
}

function HeaderSection({ c, t }: SP) {
  // Format: "ラベル|URL" per item, comma-separated. Falls back to label-only if no "|"
  const navItems = (c.navItems || '診療案内|#concept,スタッフ紹介|#staff,アクセス|#contact')
    .split(',')
    .filter(Boolean)
    .map((item: string) => {
      const [label, href] = item.split('|')
      return { label: label.trim(), href: href?.trim() || '#' }
    })
  return (
    <div className="sticky top-0 z-50 shadow-sm" style={{ background: t.headerBg, borderBottom: `1px solid ${t.headerBorder}` }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          {c.logoImageUrl
            ? <img src={c.logoImageUrl} alt="logo" className="h-9 w-auto object-contain" />
            : <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-lg font-bold shrink-0" style={{ background: t.accent }}>🦷</div>
          }
          <span className="text-base font-bold tracking-tight" style={{ color: t.logoColor }}>{c.logoText || 'クリニック名'}</span>
        </div>
        {/* Nav */}
        <nav
          className="header-nav hidden md:flex items-center gap-1 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        >
          {navItems.map(({ label, href }: { label: string; href: string }) => (
            <a key={label} href={href} className="px-3 py-1.5 text-sm rounded-md transition-colors hover:opacity-70 whitespace-nowrap shrink-0" style={{ color: t.headerText }}>
              {label}
            </a>
          ))}
        </nav>
        {/* CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {c.phone && (
            <a href={`tel:${c.phone}`} className="hidden sm:flex items-center gap-1.5 text-sm font-bold" style={{ color: t.accent }}>
              <span>📞</span>{c.phone}
            </a>
          )}
          <a href="#" className="px-4 py-2 text-xs font-bold rounded-lg text-white" style={{ background: t.accent }}>
            Web予約
          </a>
        </div>
      </div>
    </div>
  )
}

function HeroSection({ c, t }: SP) {
  const hasImage = !!c.imageUrl
  const overlay = `rgba(0,0,0,${(c.overlayOpacity ?? 45) / 100})`
  return (
    <div
      className="relative flex items-center justify-center text-center overflow-hidden"
      style={{ minHeight: 560 }}
    >
      {/* Background — use <img> for uploaded base64, gradient as fallback */}
      {hasImage
        ? <img src={c.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        : <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${t.accent} 0%, ${t.heroBtnBg}cc 100%)` }} />
      }
      <div className="absolute inset-0" style={{ background: hasImage ? overlay : 'rgba(0,0,0,0.25)' }} />
      <div className="relative z-10 px-6 max-w-3xl">
        <div className="inline-block px-4 py-1 rounded-full text-xs font-semibold tracking-widest mb-5 uppercase" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
          Dental Clinic
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
          {c.title || 'クリニック名'}
        </h1>
        <p className="text-white/85 text-lg mb-8 leading-relaxed">{c.subtitle}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="#" className="px-8 py-3.5 rounded-full text-sm font-bold shadow-lg transition" style={{ background: t.heroBtnBg, color: t.heroBtnText }}>
            {c.ctaText || 'Web予約はこちら'}
          </a>
          {c.ctaText2 && (
            <a href="#" className="px-8 py-3.5 rounded-full text-sm font-bold text-white border-2 transition" style={{ borderColor: t.heroBtn2Border }}>
              {c.ctaText2}
            </a>
          )}
        </div>
      </div>
      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden">
        <svg viewBox="0 0 1200 48" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,48 C300,0 900,0 1200,48 L1200,48 L0,48 Z" fill="#fff" fillOpacity="0.08" />
        </svg>
      </div>
    </div>
  )
}

function ConceptSection({ c, t }: SP) {
  const hasImage = !!c.imageUrl
  return (
    <div className="py-20 px-6" style={{ background: t.sectionAltBg }}>
      <div className="max-w-5xl mx-auto">
        <div className={`flex flex-col ${hasImage ? 'md:flex-row' : ''} items-center gap-12`}>
          {hasImage && (
            <div className="w-full md:w-2/5 shrink-0">
              <img src={c.imageUrl} alt="concept" className="w-full h-72 object-cover rounded-2xl shadow-lg" />
            </div>
          )}
          <div className={hasImage ? 'flex-1' : 'text-center max-w-2xl mx-auto'}>
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: t.accent }}>{c.subtitle || 'Philosophy'}</p>
            <h2 className="text-3xl font-bold mb-6" style={{ color: t.accent }}>{c.title || 'クリニックの想い'}</h2>
            <div className="w-12 h-1 rounded-full mb-6" style={{ background: t.accent, margin: hasImage ? undefined : '0 auto 1.5rem' }} />
            <div
              className="text-base leading-8 text-gray-600 [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_s]:line-through [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: c.body || '' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FeaturesSection({ c, t }: SP) {
  const items = c.items || []
  return (
    <div className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: t.accent }}>Features</p>
          <h2 className="text-3xl font-bold text-gray-900">{c.title || '選ばれる理由'}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item: any, i: number) => (
            <div key={i} className="rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow" style={{ background: t.cardBg }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: t.cardIconBg }}>
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
              <div className="text-sm text-gray-500 leading-relaxed [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_s]:line-through [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4" dangerouslySetInnerHTML={{ __html: item.desc || '' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ServicesSection({ c, t }: SP) {
  const items = (c.items || '').split(',').filter(Boolean)
  return (
    <div className="py-20 px-6" style={{ background: t.sectionAltBg }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: t.accent }}>Services</p>
          <h2 className="text-3xl font-bold text-gray-900">{c.title || '診療内容'}</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {items.map((item: string, i: number) => (
            <span key={i} className="px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-colors cursor-pointer hover:opacity-80" style={{ borderColor: t.dividerColor, background: t.badgeBg, color: t.badgeText }}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function StaffSection({ c, t }: SP) {
  return (
    <div className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: t.accent }}>{c.subtitle || 'Our Doctor'}</p>
          <h2 className="text-3xl font-bold text-gray-900">{c.title || 'スタッフ紹介'}</h2>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-10 rounded-2xl p-8 shadow-sm" style={{ background: t.cardBg }}>
          {/* Photo */}
          <div className="shrink-0">
            {c.staffImageUrl
              ? <img src={c.staffImageUrl} alt={c.staffName} className="w-44 h-44 rounded-full object-cover shadow-lg border-4" style={{ borderColor: t.accentLight }} />
              : <div className="w-44 h-44 rounded-full flex items-center justify-center text-6xl shadow-lg border-4" style={{ background: t.cardIconBg, borderColor: t.accentLight }}>👨‍⚕️</div>
            }
          </div>
          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm font-semibold mb-1" style={{ color: t.accent }}>{c.staffTitle}</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{c.staffName}</h3>
            {c.staffCredentials && (
              <p className="text-xs text-gray-500 mb-4">{c.staffCredentials}</p>
            )}
            <div className="w-8 h-0.5 rounded mb-4 md:mx-0 mx-auto" style={{ background: t.accent }} />
            <div className="text-sm leading-8 text-gray-600 italic [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_s]:line-through [&_h2]:text-base [&_h2]:font-bold [&_h2]:not-italic [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:not-italic [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4" dangerouslySetInnerHTML={{ __html: c.staffMessage ? `"${c.staffMessage}"` : '' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function GallerySection({ c, t }: SP) {
  // Only render uploaded images — skip empty slots
  const images: string[] = (c.images || []).filter((url: string) => !!url).slice(0, 6)

  if (images.length === 0) return null

  // Grid columns based on image count
  const gridClass =
    images.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' :
    images.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' :
    images.length === 4 ? 'grid-cols-2 md:grid-cols-2' :
    'grid-cols-2 md:grid-cols-3'

  // First image spans full width when count is odd and > 1
  const hasFeature = images.length === 3 || images.length === 5

  return (
    <div className="py-20 px-6" style={{ background: t.sectionAltBg }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: t.accent }}>Gallery</p>
          <h2 className="text-3xl font-bold text-gray-900">{c.title || '院内のご案内'}</h2>
        </div>
        <div className={`grid ${gridClass} gap-4`}>
          {images.map((url, i) => (
            <div
              key={i}
              className={[
                'rounded-xl overflow-hidden shadow-sm',
                // First image spans 2 cols when count is 3 or 5
                hasFeature && i === 0 ? 'col-span-2 aspect-[16/7]' : 'aspect-video',
              ].join(' ')}
            >
              <img src={url} alt={`gallery-${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ContactSection({ c, t }: SP) {
  const hoursRows = (c.hours || '').split('\n').filter(Boolean).map((row: string) => {
    const [day, time] = row.split('|')
    return { day, time }
  })
  return (
    <div className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: t.accent }}>Access</p>
          <h2 className="text-3xl font-bold text-gray-900">{c.title || 'アクセス・診療時間'}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Google Maps embed */}
          <div className="rounded-2xl overflow-hidden h-64 shadow-sm">
            {c.address ? (
              <iframe
                title="map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(c.address)}&t=m&z=16&output=embed&iwloc=B&hl=ja`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl" style={{ background: t.cardIconBg }}>🗺️</div>
            )}
          </div>
          {/* Info */}
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">📍</span>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">住所</p>
                <p className="text-sm text-gray-800">{c.address}</p>
                {c.access && <p className="text-xs text-gray-500 mt-1">{c.access}</p>}
              </div>
            </div>
            {c.phone && (
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">📞</span>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">お電話</p>
                  <p className="text-lg font-bold" style={{ color: t.accent }}>{c.phone}</p>
                </div>
              </div>
            )}
            {hoursRows.length > 0 && (
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: t.dividerColor }}>
                {hoursRows.map((row: any, i: number) => (
                  <div key={i} className="grid grid-cols-2 text-sm border-b last:border-0" style={{ borderColor: t.dividerColor }}>
                    <div className="px-4 py-2.5 font-semibold text-gray-600" style={{ background: t.sectionAltBg }}>{row.day}</div>
                    <div className="px-4 py-2.5 text-gray-700">{row.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CtaBannerSection({ c, t }: SP) {
  return (
    <div className="py-16 px-6" style={{ background: t.accent }}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-white mb-3">{c.title}</h2>
        <p className="text-white/80 mb-8">{c.subtitle}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#" className="px-8 py-3.5 rounded-full text-sm font-bold bg-white shadow-lg hover:shadow-xl transition" style={{ color: t.accent }}>
            {c.ctaText || 'Web予約する'}
          </a>
          {c.phone && (
            <a href={`tel:${c.phone}`} className="flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold text-white border-2 border-white/60 hover:bg-white/10 transition">
              <span>📞</span> {c.phone}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function FooterSection({ c, t }: SP) {
  return (
    <div className="py-14 px-6" style={{ background: t.footerBg, borderTop: `1px solid ${t.footerBorder}` }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: t.accent }}>🦷</div>
              <span className="font-bold" style={{ color: t.accent }}>{c.clinicName}</span>
            </div>
            {c.address && <p className="text-xs leading-relaxed mb-2" style={{ color: t.footerText }}>{c.address}</p>}
            {c.phone && <p className="text-sm font-bold mb-1" style={{ color: t.accent }}>{c.phone}</p>}
            {c.hours && <p className="text-xs" style={{ color: t.footerText }}>{c.hours}</p>}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: t.footerText }}>診療案内</p>
            <div className="space-y-2 text-xs" style={{ color: t.footerText }}>
              {['一般歯科', '小児歯科', '矯正歯科', 'インプラント', 'ホワイトニング'].map(item => (
                <p key={item}><a href="#" className="hover:opacity-70 transition">{item}</a></p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: t.footerText }}>クリニック情報</p>
            <div className="space-y-2 text-xs" style={{ color: t.footerText }}>
              {['院長挨拶', 'スタッフ紹介', '施設案内', 'アクセス', 'お問い合わせ'].map(item => (
                <p key={item}><a href="#" className="hover:opacity-70 transition">{item}</a></p>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-6 text-center text-xs" style={{ borderTop: `1px solid ${t.footerBorder}`, color: t.footerText }}>
          {c.copyright || '© 2024 クリニック All Rights Reserved.'}
        </div>
      </div>
    </div>
  )
}

// ─── Main renderer ───────────────────────────────────────────────────────────

export function LandingPageRenderer({
  sections,
  themeId,
  templateId = 'modern',
  customTheme,
  extraThemes = {},
  freeTemplate,
}: {
  sections: PageSection[]
  themeId: ThemeId
  templateId?: TemplateId
  customTheme?: Partial<LPTheme>
  extraThemes?: Record<string, LPTheme>
  freeTemplate?: FreeTemplate
}) {
  const t = { ...(extraThemes[themeId] ?? Object.values(extraThemes)[0] ?? {} as LPTheme), ...customTheme }

  if (templateId.startsWith('free_') && freeTemplate) {
    return <FreeTemplateRenderer template={freeTemplate} sections={sections} t={t} />
  }

  if (templateId === 'professional') return <Template2Renderer sections={sections} t={t} />
  if (templateId === 'boutique')     return <Template3Renderer sections={sections} t={t} />

  // Default: Modern (Template 1)
  return (
    <div className="font-sans antialiased text-gray-800 bg-white">
      {sections.filter(s => s.visible).map(s => {
        const props = { c: s.content, t }
        switch (s.type) {
          case 'topbar':     return <TopBarSection key={s.id} {...props} />
          case 'header':     return <HeaderSection key={s.id} {...props} />
          case 'hero':       return <HeroSection key={s.id} {...props} />
          case 'concept':    return <ConceptSection key={s.id} {...props} />
          case 'features':   return <FeaturesSection key={s.id} {...props} />
          case 'services':   return <ServicesSection key={s.id} {...props} />
          case 'staff':      return <StaffSection key={s.id} {...props} />
          case 'gallery':    return <GallerySection key={s.id} {...props} />
          case 'contact':    return <ContactSection key={s.id} {...props} />
          case 'cta_banner': return <CtaBannerSection key={s.id} {...props} />
          case 'footer':     return <FooterSection key={s.id} {...props} />
          default:           return null
        }
      })}
    </div>
  )
}
