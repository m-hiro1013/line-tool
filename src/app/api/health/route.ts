// src/app/api/health/route.ts
// ヘルスチェック＆DB接続確認用API🔥

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()

        // storesテーブルからカウント取得（接続テスト）
        const { count, error } = await supabase
            .from('stores')
            .select('*', { count: 'exact', head: true })

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Database connection failed',
                    error: error.message
                },
                { status: 500 }
            )
        }

        return NextResponse.json({
            status: 'ok',
            message: 'Database connected successfully!',
            stores_count: count,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Health check error:', error)
        return NextResponse.json(
            {
                status: 'error',
                message: 'Internal server error'
            },
            { status: 500 }
        )
    }
}