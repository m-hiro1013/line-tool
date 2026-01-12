// src/app/api/broadcast/execute/route.ts
// 配信実行API（QStashから呼び出される）🔥

import { NextRequest, NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { FlexContainer } from '@line/bot-sdk'
import { createClient } from '@/lib/supabase/server'
import { createLineClient, broadcastFlexMessage } from '@/lib/line/client'

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

// 配信実行処理
async function handler(request: NextRequest) {
    try {
        const body = await request.json()

        const { job_id, template_id, store_ids, media_selections } = body

        if (!job_id || !template_id || !store_ids || !media_selections) {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // ジョブのステータスを'sending'に更新
        await supabase
            .from('broadcast_jobs')
            .update({ status: 'sending' })
            .eq('id', job_id)

        // 1. テンプレート取得
        const { data: template, error: templateError } = await supabase
            .from('templates')
            .select('*')
            .eq('id', template_id)
            .single()

        if (templateError || !template) {
            await supabase
                .from('broadcast_jobs')
                .update({
                    status: 'failed',
                    error_details: { error: 'Template not found' },
                    completed_at: new Date().toISOString(),
                })
                .eq('id', job_id)

            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            )
        }

        // 2. 対象店舗取得
        const { data: stores, error: storesError } = await supabase
            .from('stores')
            .select('*')
            .in('id', store_ids)

        if (storesError || !stores || stores.length === 0) {
            await supabase
                .from('broadcast_jobs')
                .update({
                    status: 'failed',
                    error_details: { error: 'Stores not found' },
                    completed_at: new Date().toISOString(),
                })
                .eq('id', job_id)

            return NextResponse.json(
                { error: 'Stores not found' },
                { status: 404 }
            )
        }

        // 3. 各店舗ごとに配信処理
        let sentCount = 0
        let failedCount = 0
        const errorDetails: Record<string, string> = {}

        for (const store of stores) {
            try {
                const selectedMediaId = media_selections[store.id]

                if (!selectedMediaId) {
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
                    sentCount++
                } else {
                    failedCount++
                    errorDetails[store.id] = sendResult.error || 'Unknown error'
                }
            } catch (error) {
                console.error(`Error processing store ${store.id}:`, error)
                failedCount++
                errorDetails[store.id] = 'Unexpected error'
            }
        }

        // 4. broadcast_jobsを更新
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
            .eq('id', job_id)

        return NextResponse.json({
            success: true,
            job_id,
            sent_count: sentCount,
            failed_count: failedCount,
        })
    } catch (error) {
        console.error('POST /api/broadcast/execute Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// QStashの署名検証をラップ
export const POST = verifySignatureAppRouter(handler)
