import { NextResponse } from 'next/server'
import pool from '@/lib/db'

// DELETE /api/lp/themes/:id
// Soft-deletes a custom (non-system) theme by theme_key
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const userId = _request.headers.get('x-user-id')

    const { rowCount } = await pool.query(
      `UPDATE themes
       SET deleted_at = now(), is_active = false, deleted_by = $2
       WHERE theme_key = $1
         AND deleted_at IS NULL`,
      [id, userId ?? null]
    )

    if (rowCount === 0) {
      return NextResponse.json(
        { error: 'Theme not found or is a system theme' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/lp/themes/:id]', err)
    return NextResponse.json({ error: 'Failed to delete theme' }, { status: 500 })
  }
}
