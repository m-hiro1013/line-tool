// src/app/api/templates/[id]/route.ts
// テンプレート詳細取得・更新・削除API🔥

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateTemplateRequest } from '@/types'

type Params = {
    params: Promise<{ id: string }>
}

// GET: テンプレート詳細取得
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Template not found' },
                    { status: 404 }
                )
            }
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch template' },
                { status: 500 }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('GET /api/templates/[id] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PUT: テンプレート更新
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const body: UpdateTemplateRequest = await request.json()

        // 空のリクエストチェック
        if (Object.keys(body).length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            )
        }

        // json_contentがある場合、オブジェクトかチェック
        if (body.json_content !== undefined && typeof body.json_content !== 'object') {
            return NextResponse.json(
                { error: 'json_content must be a valid JSON object' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('templates')
            .update({
                ...(body.name !== undefined && { name: body.name }),
                ...(body.json_content !== undefined && { json_content: body.json_content }),
                ...(body.thumbnail_url !== undefined && { thumbnail_url: body.thumbnail_url }),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Template not found' },
                    { status: 404 }
                )
            }
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to update template' },
                { status: 500 }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('PUT /api/templates/[id] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE: テンプレート削除
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { error } = await supabase
            .from('templates')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to delete template' },
                { status: 500 }
            )
        }

        return NextResponse.json({ message: 'Template deleted successfully' })
    } catch (error) {
        console.error('DELETE /api/templates/[id] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}