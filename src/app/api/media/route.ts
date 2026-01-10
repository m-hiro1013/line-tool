// src/app/api/media/route.ts
// 媒体一覧取得・新規登録API🔥

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateMediaRequest } from '@/types'

// GET: 媒体一覧取得
export async function GET() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('media')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch media' },
                { status: 500 }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('GET /api/media Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST: 媒体新規登録
export async function POST(request: NextRequest) {
    try {
        const body: CreateMediaRequest = await request.json()

        // バリデーション
        if (!body.name) {
            return NextResponse.json(
                { error: 'name is required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('media')
            .insert({
                name: body.name,
            })
            .select()
            .single()

        if (error) {
            // UNIQUE制約違反
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'Media with this name already exists' },
                    { status: 409 }
                )
            }
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to create media' },
                { status: 500 }
            )
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('POST /api/media Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}