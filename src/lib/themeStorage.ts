// Theme storage — backed by PostgreSQL via /api/lp/themes
// Replaces the previous IndexedDB implementation; public interface is unchanged.
import type { LPTheme } from '@/components/clinic/LandingPageRenderer'

export async function saveTheme(id: string, theme: LPTheme, pickerValues?: Record<string, string>): Promise<void> {
  const res = await fetch('/api/lp/themes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, theme, pickerValues }),
  })
  if (!res.ok) throw new Error(`saveTheme failed: ${res.status}`)
}

export async function loadAllThemes(): Promise<Record<string, LPTheme>> {
  const res = await fetch('/api/lp/themes')
  if (!res.ok) throw new Error(`loadAllThemes failed: ${res.status}`)
  return res.json()
}

export async function deleteTheme(id: string): Promise<void> {
  const res = await fetch(`/api/lp/themes/${encodeURIComponent(id)}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`deleteTheme failed: ${res.status}`)
}

// ── Helpers (pure — no DB dependency) ─────────────────────────────────────────

function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function contrastText(bg: string): string {
  return getLuminance(bg) > 0.5 ? '#1e293b' : '#ffffff'
}

function mixWithWhite(hex: string, weight: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lr = Math.round(r * weight + 255 * (1 - weight))
  const lg = Math.round(g * weight + 255 * (1 - weight))
  const lb = Math.round(b * weight + 255 * (1 - weight))
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`
}

function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount)
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount)
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/** Build a full LPTheme from the 6 key picker values */
export function buildTheme(
  nameJa: string,
  accent: string,
  topbarBg: string,
  headerBg: string,
  footerBg: string,
  cardBg: string,
  sectionAltBg: string,
): LPTheme {
  const accentLight   = mixWithWhite(accent, 0.15)
  const accentText    = darken(accent, 20)
  const headerBorder  = mixWithWhite(darken(headerBg, 30), 0.5)
  const footerBorder  = darken(footerBg, 20)
  const cardIconBg    = mixWithWhite(accent, 0.12)
  const dividerColor  = mixWithWhite(accent, 0.25)

  return {
    nameJa,
    topbarBg,
    topbarText:     contrastText(topbarBg),
    headerBg,
    headerText:     contrastText(headerBg),
    headerBorder,
    logoColor:      accent,
    accent,
    accentLight,
    accentText,
    heroBtnBg:      accent,
    heroBtnText:    '#ffffff',
    heroBtn2Border: 'rgba(255,255,255,0.7)',
    sectionAltBg,
    cardBg,
    cardIconBg,
    dividerColor,
    footerBg,
    footerText:     contrastText(footerBg) === '#ffffff' ? '#94a3b8' : '#6b7280',
    footerBorder,
    badgeBg:        accentLight,
    badgeText:      accentText,
  }
}
