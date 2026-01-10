// src/app/api/stores/[id]/route.ts
// 店舗詳細取得・更新・削除API🔥

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateStoreRequest } from '@/types'

type Params = {
    params: Promise<{ id: string }>
}

// GET: 店舗詳細取得
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Store not found' },
                    { status: 404 }
                )
            }
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch store' },
                { status: 500 }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('GET /api/stores/[id] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PUT: 店舗更新
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const body: UpdateStoreRequest = await request.json()

        // 空のリクエストチェック
        if (Object.keys(body).length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('stores')
            .update({
                ...(body.name !== undefined && { name: body.name }),
                ...(body.line_channel_id !== undefined && { line_channel_id: body.line_channel_id }),
                ...(body.line_channel_secret !== undefined && { line_channel_secret: body.line_channel_secret }),
                ...(body.line_channel_access_token !== undefined && { line_channel_access_token: body.line_channel_access_token }),
                ...(body.webhook_url !== undefined && { webhook_url: body.webhook_url }),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Store not found' },
                    { status: 404 }
                )
            }
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to update store' },
                { status: 500 }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('PUT /api/stores/[id] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE: 店舗削除
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { error } = await supabase
            .from('stores')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to delete store' },
                { status: 500 }
            )
        }

        return NextResponse.json({ message: 'Store deleted successfully' })
    } catch (error) {
        console.error('DELETE /api/stores/[id] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}