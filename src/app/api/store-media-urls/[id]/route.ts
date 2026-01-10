// src/app/api/store-media-urls/[id]/route.ts
// 店舗×媒体URL 削除API🔥

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = {
    params: Promise<{ id: string }>
}

// DELETE: 店舗×媒体URL削除
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { error } = await supabase
            .from('store_media_urls')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to delete store media url' },
                { status: 500 }
            )
        }

        return NextResponse.json({ message: 'Store media url deleted successfully' })
    } catch (error) {
        console.error('DELETE /api/store-media-urls/[id] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}