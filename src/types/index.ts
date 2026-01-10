// src/types/index.ts
// プロジェクト全体の型定義🔥

// ========================================
// Database Types（Supabaseテーブル）
// ========================================

// 店舗マスタ
export type Store = {
    id: string
    name: string
    line_channel_id: string | null
    line_channel_secret: string | null
    line_channel_access_token: string
    webhook_url: string | null
    created_at: string
    updated_at: string
}

// Flex Messageテンプレート
export type Template = {
    id: string
    name: string
    json_content: object
    thumbnail_url: string | null
    created_at: string
    updated_at: string
}

// 媒体マスタ
export type Media = {
    id: string
    name: string
    created_at: string
}

// 店舗×媒体URL
export type StoreMediaUrl = {
    id: string
    store_id: string
    media_id: string
    url: string
    created_at: string
    updated_at: string
}

// 配信ジョブ
export type BroadcastJob = {
    id: string
    template_id: string | null
    status: 'pending' | 'sending' | 'completed' | 'failed'
    target_store_ids: string[]
    sent_count: number
    failed_count: number
    error_details: object | null
    x_line_request_id: string | null
    created_at: string
    completed_at: string | null
}

// ========================================
// API Request/Response Types
// ========================================

// 店舗作成リクエスト
export type CreateStoreRequest = {
    name: string
    line_channel_id?: string
    line_channel_secret?: string
    line_channel_access_token: string
    webhook_url?: string
}

// 店舗更新リクエスト
export type UpdateStoreRequest = Partial<CreateStoreRequest>

// テンプレート作成リクエスト
export type CreateTemplateRequest = {
    name: string
    json_content: object
    thumbnail_url?: string
}

// テンプレート更新リクエスト
export type UpdateTemplateRequest = Partial<CreateTemplateRequest>

// 媒体作成リクエスト
export type CreateMediaRequest = {
    name: string
}

// 店舗×媒体URL作成リクエスト
export type CreateStoreMediaUrlRequest = {
    store_id: string
    media_id: string
    url: string
}

// 一括配信リクエスト
export type CreateBroadcastRequest = {
    template_id: string
    store_ids: string[]
    media_selections: Record<string, string> // { store_id: media_id }
}

// 一括配信レスポンス
export type BroadcastResult = {
    job_id: string
    status: 'completed' | 'failed'
    sent_count: number
    failed_count: number
    results: {
        store_id: string
        store_name: string
        success: boolean
        error?: string
    }[]
}

// ========================================
// API Response Types
// ========================================

export type ApiResponse<T> = {
    data: T
    error: null
} | {
    data: null
    error: string
}

// ========================================
// Utility Types
// ========================================

// 店舗×媒体URL（リレーション含む）
export type StoreMediaUrlWithRelations = StoreMediaUrl & {
    store?: Store
    media?: Media
}