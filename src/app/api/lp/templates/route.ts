import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { FreeTemplate } from '@/lib/templateStorage'

// GET /api/lp/templates
// Returns all active free (admin-created) templates as Record<string, FreeTemplate>
export async function GET() {
  try {
    const { rows } = await pool.query<{
      template_key: string
      name_ja: string
      description: string
      font_family: string
      lp_sections: FreeTemplate['sections']
    }>(
      `SELECT template_key, name_ja, description, font_family, lp_sections
       FROM templates
       WHERE is_active = true
         AND lp_sections IS NOT NULL
         AND deleted_at IS NULL
       ORDER BY sort_order ASC, created_at ASC`
    )

    const result: Record<string, FreeTemplate> = {}
    for (const row of rows) {
      result[row.template_key] = {
        nameJa:     row.name_ja,
        desc:       row.description,
        fontFamily: row.font_family as FreeTemplate['fontFamily'],
        sections:   row.lp_sections,
      }
    }
    return NextResponse.json(result)
  } catch (err) {
    console.error('[GET /api/lp/templates]', err)
    return NextResponse.json({ error: 'Failed to load templates' }, { status: 500 })
  }
}

// POST /api/lp/templates
// Body: { id: string; template: FreeTemplate }
// Creates or updates a free template (id must start with 'free_')
export async function POST(request: Request) {
  try {
    const body = await request.json() as { id: string; template: FreeTemplate }
    const { id, template } = body

    if (!id || !template) {
      return NextResponse.json({ error: 'id and template are required' }, { status: 400 })
    }

    await pool.query(
      `INSERT INTO templates
         (name, template_key, name_ja, description, font_family, lp_sections,
          template_type, is_system, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, 'landing', false, true, 100)
       ON CONFLICT (template_key) DO UPDATE
         SET name_ja      = EXCLUDED.name_ja,
             description  = EXCLUDED.description,
             font_family  = EXCLUDED.font_family,
             lp_sections  = EXCLUDED.lp_sections,
             updated_at   = now()`,
      [
        template.nameJa,
        id,
        template.nameJa,
        template.desc,
        template.fontFamily,
        JSON.stringify(template.sections),
      ]
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[POST /api/lp/templates]', err)
    return NextResponse.json({ error: 'Failed to save template' }, { status: 500 })
  }
}
