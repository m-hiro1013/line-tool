// src/app/api/broadcast/schedule/route.ts
// 日時指定配信スケジュールAPI🔥

import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@upstash/qstash'
import { createClient } from '@/lib/supabase/server'

const qstashClient = new Client({
    token: process.env.QSTASH_TOKEN!,
})

// POST: 配信をスケジュール
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

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

        if (!body.scheduled_at) {
            return NextResponse.json(
                { error: 'scheduled_at is required' },
                { status: 400 }
            )
        }

        const scheduledAt = new Date(body.scheduled_at)
        const now = new Date()

        if (scheduledAt <= now) {
            return NextResponse.json(
                { error: '配信日時は現在より後の日時を指定してください' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // broadcast_jobsにレコード作成（status: 'scheduled'）
        const { data: job, error: jobError } = await supabase
            .from('broadcast_jobs')
            .insert({
                template_id: body.template_id,
                status: 'scheduled',
                target_store_ids: body.store_ids,
                sent_count: 0,
                failed_count: 0,
                scheduled_at: body.scheduled_at,
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

        // QStashでスケジュール
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const callbackUrl = `${appUrl}/api/broadcast/execute`

        const qstashResponse = await qstashClient.publishJSON({
            url: callbackUrl,
            body: {
                job_id: job.id,
                template_id: body.template_id,
                store_ids: body.store_ids,
                media_selections: body.media_selections,
            },
            notBefore: Math.floor(scheduledAt.getTime() / 1000), // Unix timestamp（秒）
        })

        // QStashのmessageIdを保存
        await supabase
            .from('broadcast_jobs')
            .update({
                qstash_message_id: qstashResponse.messageId,
            })
            .eq('id', job.id)

        return NextResponse.json({
            success: true,
            job_id: job.id,
            scheduled_at: body.scheduled_at,
            message: `${scheduledAt.toLocaleString('ja-JP')} に配信予約しました`,
        })
    } catch (error) {
        console.error('POST /api/broadcast/schedule Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
