// src/app/api/store-media-urls/route.ts
// 店舗×媒体URL 取得・登録API🔥

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateStoreMediaUrlRequest } from '@/types'

// GET: 店舗ごとのURL取得（クエリパラメータで店舗ID指定）
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const storeId = searchParams.get('store_id')

        const supabase = await createClient()

        let query = supabase
            .from('store_media_urls')
            .select(`
        *,
        store:stores(id, name),
        media:media(id, name)
      `)
            .order('created_at', { ascending: false })

        // store_idが指定されていればフィルタ
        if (storeId) {
            query = query.eq('store_id', storeId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch store media urls' },
                { status: 500 }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('GET /api/store-media-urls Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST: 店舗×媒体URL登録（UPSERT）
export async function POST(request: NextRequest) {
    try {
        const body: CreateStoreMediaUrlRequest = await request.json()

        // バリデーション
        if (!body.store_id || !body.media_id || !body.url) {
            return NextResponse.json(
                { error: 'store_id, media_id, and url are required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // UPSERT: 同じstore_id + media_idがあれば更新、なければ挿入
        const { data, error } = await supabase
            .from('store_media_urls')
            .upsert(
                {
                    store_id: body.store_id,
                    media_id: body.media_id,
                    url: body.url,
                },
                {
                    onConflict: 'store_id,media_id',
                }
            )
            .select(`
        *,
        store:stores(id, name),
        media:media(id, name)
      `)
            .single()

        if (error) {
            // 外部キー制約違反
            if (error.code === '23503') {
                return NextResponse.json(
                    { error: 'Invalid store_id or media_id' },
                    { status: 400 }
                )
            }
            console.error('Supabase Error:', error)
            return NextResponse.json(
                { error: 'Failed to create store media url' },
                { status: 500 }
            )
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('POST /api/store-media-urls Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}