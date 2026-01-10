// src/app/api/stores/route.ts
// 店舗一覧取得・新規登録API🔥

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateStoreRequest } from '@/types'

// GET: 店舗一覧取得
export async function GET() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch stores' },
                { status: 500 }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('GET /api/stores Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST: 店舗新規登録
export async function POST(request: NextRequest) {
    try {
        const body: CreateStoreRequest = await request.json()

        // バリデーション
        if (!body.name || !body.line_channel_access_token) {
            return NextResponse.json(
                { error: 'name and line_channel_access_token are required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('stores')
            .insert({
                name: body.name,
                line_channel_id: body.line_channel_id || null,
                line_channel_secret: body.line_channel_secret || null,
                line_channel_access_token: body.line_channel_access_token,
                webhook_url: body.webhook_url || null,
            })
            .select()
            .single()

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to create store' },
                { status: 500 }
            )
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('POST /api/stores Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}