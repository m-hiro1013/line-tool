// src/app/api/media/[id]/route.ts
// 媒体削除API🔥

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = {
    params: Promise<{ id: string }>
}

// DELETE: 媒体削除
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { error } = await supabase
            .from('media')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to delete media' },
                { status: 500 }
            )
        }

        return NextResponse.json({ message: 'Media deleted successfully' })
    } catch (error) {
        console.error('DELETE /api/media/[id] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}