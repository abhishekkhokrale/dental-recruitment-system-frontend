import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { LPTheme } from '@/components/clinic/LandingPageRenderer'

// GET /api/lp/themes
// Returns all active themes as Record<string, LPTheme>
export async function GET() {
  try {
    const { rows } = await pool.query<{
      theme_key: string
      lp_theme_data: LPTheme
    }>(
      `SELECT theme_key, lp_theme_data
       FROM themes
       WHERE is_active = true
         AND theme_key IS NOT NULL
         AND lp_theme_data IS NOT NULL
         AND deleted_at IS NULL
       ORDER BY sort_order ASC, created_at ASC`
    )

    const result: Record<string, LPTheme> = {}
    for (const row of rows) {
      result[row.theme_key] = row.lp_theme_data
    }
    return NextResponse.json(result)
  } catch (err) {
    console.error('[GET /api/lp/themes]', err)
    return NextResponse.json({ error: 'Failed to load themes' }, { status: 500 })
  }
}

// POST /api/lp/themes
// Body: { id: string; theme: LPTheme; pickerValues?: object }
export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      id: string
      theme: LPTheme
      pickerValues?: Record<string, string>
    }

    const { id, theme, pickerValues } = body
    if (!id || !theme) {
      return NextResponse.json({ error: 'id and theme are required' }, { status: 400 })
    }

    await pool.query(
      `INSERT INTO themes (name, theme_key, name_ja, lp_theme_data, picker_values, is_system, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, false, true, 100)
       ON CONFLICT (theme_key) DO UPDATE
         SET lp_theme_data  = EXCLUDED.lp_theme_data,
             name_ja        = EXCLUDED.name_ja,
             picker_values  = EXCLUDED.picker_values,
             updated_at     = now()`,
      [theme.nameJa, id, theme.nameJa, JSON.stringify(theme), pickerValues ? JSON.stringify(pickerValues) : null]
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[POST /api/lp/themes]', err)
    return NextResponse.json({ error: 'Failed to save theme' }, { status: 500 })
  }
}
