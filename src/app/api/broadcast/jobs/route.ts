// src/app/api/broadcast/jobs/route.ts
// 配信履歴一覧取得API🔥

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: 配信履歴一覧取得
export async function GET() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('broadcast_jobs')
            .select(`
        *,
        template:templates(id, name)
      `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch broadcast jobs' },
                { status: 500 }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('GET /api/broadcast/jobs Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}