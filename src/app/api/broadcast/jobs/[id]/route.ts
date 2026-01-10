// src/app/api/broadcast/jobs/[id]/route.ts
// 配信詳細取得API🔥

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = {
    params: Promise<{ id: string }>
}

// GET: 配信詳細取得
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('broadcast_jobs')
            .select(`
        *,
        template:templates(id, name, json_content)
      `)
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Broadcast job not found' },
                    { status: 404 }
                )
            }
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch broadcast job' },
                { status: 500 }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('GET /api/broadcast/jobs/[id] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}