// src/app/api/templates/route.ts
// テンプレート一覧取得・新規登録API🔥

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateTemplateRequest } from '@/types'

// GET: テンプレート一覧取得
export async function GET() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('templates')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch templates' },
                { status: 500 }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('GET /api/templates Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST: テンプレート新規登録
export async function POST(request: NextRequest) {
    try {
        const body: CreateTemplateRequest = await request.json()

        // バリデーション
        if (!body.name || !body.json_content) {
            return NextResponse.json(
                { error: 'name and json_content are required' },
                { status: 400 }
            )
        }

        // json_contentがオブジェクトかチェック
        if (typeof body.json_content !== 'object') {
            return NextResponse.json(
                { error: 'json_content must be a valid JSON object' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('templates')
            .insert({
                name: body.name,
                json_content: body.json_content,
                thumbnail_url: body.thumbnail_url || null,
            })
            .select()
            .single()

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to create template' },
                { status: 500 }
            )
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('POST /api/templates Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}