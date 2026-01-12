// src/lib/line/client.ts
// LINE Messaging APIクライアント🔥

import { messagingApi, HTTPFetchError } from '@line/bot-sdk'

// 店舗ごとのアクセストークンでクライアントを生成
export function createLineClient(channelAccessToken: string) {
    return new messagingApi.MessagingApiClient({
        channelAccessToken,
    })
}

// Flex Messageをプッシュ送信
export async function pushFlexMessage(
    client: messagingApi.MessagingApiClient,
    to: string,
    flexContent: unknown,
    altText: string = '新しいメッセージが届きました'
) {
    try {
        const result = await client.pushMessage({
            to,
            messages: [
                {
                    type: 'flex',
                    altText,
                    contents: flexContent as messagingApi.FlexContainer,
                },
            ],
        })

        console.log('LINE送信成功:', result)
        return { success: true, requestId: JSON.stringify(result) }
    } catch (error) {
        if (error instanceof HTTPFetchError) {
            console.error('LINE API Error:', error.status, error.body)
            return {
                success: false,
                error: `LINE API Error: ${error.status}`,
                details: error.body
            }
        }
        throw error
    }
}

// ブロードキャスト（全友だちに送信）
export async function broadcastFlexMessage(
    client: messagingApi.MessagingApiClient,
    flexContent: unknown,
    altText: string = '新しいメッセージが届きました'
) {
    try {
        const result = await client.broadcast({
            messages: [
                {
                    type: 'flex',
                    altText,
                    contents: flexContent as messagingApi.FlexContainer,
                },
            ],
        })

        console.log('LINE配信成功:', result)
        return { success: true, requestId: JSON.stringify(result) }
    } catch (error) {
        if (error instanceof HTTPFetchError) {
            console.error('LINE API Error:', error.status, error.body)
            return {
                success: false,
                error: `LINE API Error: ${error.status}`,
                details: error.body
            }
        }
        throw error
    }
}