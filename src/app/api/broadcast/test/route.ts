// src/app/api/broadcast/test/route.ts
// テスト配信API（自分だけに送信）🔥

import { NextRequest, NextResponse } from 'next/server'
import { FlexContainer } from '@line/bot-sdk'
import { createClient } from '@/lib/supabase/server'
import { createLineClient, pushFlexMessage } from '@/lib/line/client'

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

// POST: テスト配信（特定ユーザーに送信）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // バリデーション
    if (!body.template_id || !body.store_id || !body.media_id || !body.test_user_id) {
      return NextResponse.json(
        { error: 'template_id, store_id, media_id, and test_user_id are required' },
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

    // 2. 店舗取得
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', body.store_id)
      .single()

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // 3. 媒体URL取得
    const { data: mediaUrl, error: mediaUrlError } = await supabase
      .from('store_media_urls')
      .select('url')
      .eq('store_id', body.store_id)
      .eq('media_id', body.media_id)
      .single()

    if (mediaUrlError || !mediaUrl) {
      return NextResponse.json(
        { error: 'Media URL not found for this store' },
        { status: 404 }
      )
    }

    // 4. 変数置換
    const variables = {
      media_url: mediaUrl.url,
      store_name: store.name,
    }
    const replacedContent = replaceVariables(template.json_content, variables)

    // 5. テスト配信（pushMessage）
    const lineClient = createLineClient(store.line_channel_access_token)
    const result = await pushFlexMessage(
      lineClient,
      body.test_user_id,
      replacedContent,
      template.name || '新しいメッセージ'
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'テスト配信が完了しました',
        requestId: result.requestId,
      })
    } else {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('POST /api/broadcast/test Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
