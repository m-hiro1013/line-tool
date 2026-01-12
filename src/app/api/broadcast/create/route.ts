// src/app/api/broadcast/create/route.ts
// Flex Message一括生成・配信API🔥

import { NextRequest, NextResponse } from 'next/server'
import { FlexContainer } from '@line/bot-sdk'
import { createClient } from '@/lib/supabase/server'
import { createLineClient, broadcastFlexMessage } from '@/lib/line/client'
import { CreateBroadcastRequest, BroadcastResult } from '@/types'

// テンプレート内の変数を置換する関数
function replaceVariables(
    jsonContent: object,
    variables: Record<string, string>
): FlexContainer {
    const jsonString = JSON.stringify(jsonContent)

    let replacedString = jsonString
    for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`
        replacedString = replacedString.split(placeholder).join(value)
    }

    return JSON.parse(replacedString) as FlexContainer
}

// POST: 一括配信実行
export async function POST(request: NextRequest) {
    try {
        const body: CreateBroadcastRequest = await request.json()

        // バリデーション
        if (!body.template_id || !body.store_ids || body.store_ids.length === 0) {
            return NextResponse.json(
                { error: 'template_id and store_ids are required' },
                { status: 400 }
            )
        }

        if (!body.media_selections || Object.keys(body.media_selections).length === 0) {
            return NextResponse.json(
                { error: 'media_selections is required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // 1. テンプレート取得
        const { data: template, error: templateError } = await supabase
            .from('templates')
            .select('*')
            .eq('id', body.template_id)
            .single()

        if (templateError || !template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            )
        }

        // 2. 対象店舗取得
        const { data: stores, error: storesError } = await supabase
            .from('stores')
            .select('*')
            .in('id', body.store_ids)

        if (storesError || !stores || stores.length === 0) {
            return NextResponse.json(
                { error: 'Stores not found' },
                { status: 404 }
            )
        }

        // 3. broadcast_jobsにレコード作成
        const { data: job, error: jobError } = await supabase
            .from('broadcast_jobs')
            .insert({
                template_id: body.template_id,
                status: 'sending',
                target_store_ids: body.store_ids,
                sent_count: 0,
                failed_count: 0,
            })
            .select()
            .single()

        if (jobError || !job) {
            console.error('Failed to create job:', jobError)
            return NextResponse.json(
                { error: 'Failed to create broadcast job' },
                { status: 500 }
            )
        }

        // 4. 各店舗ごとに配信処理
        const results: BroadcastResult['results'] = []
        let sentCount = 0
        let failedCount = 0
        const errorDetails: Record<string, string> = {}

        for (const store of stores) {
            try {
                // 選択された媒体IDを取得
                const selectedMediaId = body.media_selections[store.id]

                if (!selectedMediaId) {
                    results.push({
                        store_id: store.id,
                        store_name: store.name,
                        success: false,
                        error: 'No media selected for this store',
                    })
                    failedCount++
                    errorDetails[store.id] = 'No media selected'
                    continue
                }

                // store_media_urlsから該当URLを取得
                const { data: mediaUrl, error: mediaUrlError } = await supabase
                    .from('store_media_urls')
                    .select('url')
                    .eq('store_id', store.id)
                    .eq('media_id', selectedMediaId)
                    .single()

                if (mediaUrlError || !mediaUrl) {
                    results.push({
                        store_id: store.id,
                        store_name: store.name,
                        success: false,
                        error: 'Media URL not found for this store',
                    })
                    failedCount++
                    errorDetails[store.id] = 'Media URL not found'
                    continue
                }

                // 変数置換
                const variables = {
                    media_url: mediaUrl.url,
                    store_name: store.name,
                }
                const replacedContent = replaceVariables(template.json_content, variables)

                // LINE配信
                const lineClient = createLineClient(store.line_channel_access_token)
                const sendResult = await broadcastFlexMessage(lineClient, replacedContent)

                if (sendResult.success) {
                    results.push({
                        store_id: store.id,
                        store_name: store.name,
                        success: true,
                    })
                    sentCount++
                } else {
                    results.push({
                        store_id: store.id,
                        store_name: store.name,
                        success: false,
                        error: sendResult.error,
                    })
                    failedCount++
                    errorDetails[store.id] = sendResult.error || 'Unknown error'
                }
            } catch (error) {
                console.error(`Error processing store ${store.id}:`, error)
                results.push({
                    store_id: store.id,
                    store_name: store.name,
                    success: false,
                    error: 'Unexpected error',
                })
                failedCount++
                errorDetails[store.id] = 'Unexpected error'
            }
        }

        // 5. broadcast_jobsを更新
        const finalStatus = failedCount === stores.length ? 'failed' : 'completed'

        await supabase
            .from('broadcast_jobs')
            .update({
                status: finalStatus,
                sent_count: sentCount,
                failed_count: failedCount,
                error_details: Object.keys(errorDetails).length > 0 ? errorDetails : null,
                completed_at: new Date().toISOString(),
            })
            .eq('id', job.id)

        // 6. 結果を返却
        const response: BroadcastResult = {
            job_id: job.id,
            status: finalStatus,
            sent_count: sentCount,
            failed_count: failedCount,
            results,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('POST /api/broadcast/create Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}