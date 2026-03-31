import { NextResponse } from 'next/server'
import pool from '@/lib/db'

// DELETE /api/lp/templates/:id
// Soft-deletes a free (admin-created) template by template_key
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const userId = _request.headers.get('x-user-id')

    const { rowCount } = await pool.query(
      `UPDATE templates
       SET deleted_at = now(), is_active = false, deleted_by = $2
       WHERE template_key = $1
         AND deleted_at IS NULL`,
      [id, userId ?? null]
    )

    if (rowCount === 0) {
      return NextResponse.json(
        { error: 'Template not found or is a system template' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/lp/templates/:id]', err)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}
