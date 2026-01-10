# =====================================
# 📋 PROJECT.yaml
# =====================================
#
# 【このファイルの役割】
# プロジェクトの定義・仕様・API設計・画面構成を記録する。
# project.mdの内容を統合。静的な仕様情報。
#
# =====================================

project:
  version: "1.0"

  # =====================================
  # 概要
  # =====================================

  overview:
    name: "飲食店LINE運用効率化ツール"
    description: |
      飲食店のLINE公式アカウント運用を効率化するSaaS型ツール。
      複数店舗の「メッセージ配信」「リッチメニュー管理」「自動応答」を一元管理し、
      運用コストを削減しながら顧客体験を向上させる。

    core_value:
      - name: "工数削減"
        description: "同じFlex Messageを複数店舗に配信する際の手作業を自動化"
      - name: "ミス防止"
        description: "店舗ごとのURL差し替え漏れを防止"
      - name: "一元管理"
        description: "全店舗のLINE運用を1つのダッシュボードで管理"

  # =====================================
  # 開発フェーズ
  # =====================================

  phases:
    - id: "phase1"
      name: "Flex Message一括配信システム（MVP）"
      status: "current"
      purpose: "複数店舗へのメッセージ配信業務の工数削減"
      features:
        - "Flex Message Simulator互換のJSONテンプレート管理"
        - "店舗ごとの予約URL/店舗情報の自動置換（{{変数名}}形式）"
        - "全店舗/指定店舗への一括下書き保存"
      flow: |
        Flex Message Simulatorでデザイン作成
        （URL部分は {{media_url}} や {{store_name}} と記載）
        ↓
        ツールにJSONをテンプレートとして登録
        ↓
        配信作成画面でテンプレート選択 → 対象店舗選択 → 各店舗の媒体選択
        ↓
        一括生成実行 → 各店舗のLINEに下書き保存

    - id: "phase2"
      name: "リッチメニュー & 自動応答"
      status: "planned"
      purpose: "顧客の利便性向上と問い合わせ対応の自動化"
      features:
        - "時間帯別リッチメニュー自動切り替え（ランチ/ディナー/閉店後）"
        - "特定キーワードに対する自動応答（Wi-Fi、営業時間、アレルギー対応など）"
        - "リッチメニューのタブ切り替え（リッチメニューエイリアス活用）"

    - id: "phase3"
      name: "セグメント配信 & 分析"
      status: "planned"
      purpose: "ブロック率の低下と再来店率（リピート）向上"
      features:
        - "属性（性別・年代・地域）によるナローキャスト配信"
        - "過去のクリックユーザー（オーディエンス）へのリターゲティング配信"
        - "店舗ごとの友だち増加数・ブロック数・開封率のダッシュボード化"

  # =====================================
  # 技術スタック
  # =====================================

  tech_stack:
    frontend:
      framework: "Next.js (App Router)"
      language: "React + TypeScript"
      styling: "Tailwind CSS"
      ui_library: "shadcn/ui"

    backend:
      framework: "Next.js Route Handlers"
      runtime: "Serverless Functions"

    database:
      service: "Supabase (PostgreSQL)"
      features:
        - "RLS有効化（フェーズ2以降）"

    storage:
      service: "Supabase Storage"
      usage: "メニュー画像、リッチメニュー画像保存"

    hosting:
      service: "Vercel"
      features:
        - "GitHub連携で自動デプロイ"

    line:
      sdk: "@line/bot-sdk (v9.0.0+)"
      features:
        - "Flex Message対応"

  # =====================================
  # 画面構成
  # =====================================

  screens:
    - name: "ダッシュボード"
      path: "/"
      description: "概要・クイックアクション"

    - name: "テンプレート管理"
      path: "/templates"
      description: "JSON登録・一覧・編集・削除"

    - name: "店舗マスタ"
      path: "/stores"
      description: "店舗情報・LINEチャネル情報の登録"

    - name: "媒体マスタ"
      path: "/media"
      description: "媒体の追加・編集・削除"

    - name: "店舗×媒体URL"
      path: "/store-media-urls"
      description: "店舗ごとの各媒体URLを登録"

    - name: "配信作成"
      path: "/broadcast"
      description: "テンプレ選択→店舗選択→媒体選択→一括生成"

  # =====================================
  # API設計
  # =====================================

  api:
    templates:
      - method: "GET"
        endpoint: "/api/templates"
        description: "一覧取得"
      - method: "POST"
        endpoint: "/api/templates"
        description: "新規登録"
      - method: "GET"
        endpoint: "/api/templates/[id]"
        description: "詳細取得"
      - method: "PUT"
        endpoint: "/api/templates/[id]"
        description: "更新"
      - method: "DELETE"
        endpoint: "/api/templates/[id]"
        description: "削除"

    stores:
      - method: "GET"
        endpoint: "/api/stores"
        description: "一覧取得"
      - method: "POST"
        endpoint: "/api/stores"
        description: "新規登録"
      - method: "GET"
        endpoint: "/api/stores/[id]"
        description: "詳細取得"
      - method: "PUT"
        endpoint: "/api/stores/[id]"
        description: "更新"
      - method: "DELETE"
        endpoint: "/api/stores/[id]"
        description: "削除"

    media:
      - method: "GET"
        endpoint: "/api/media"
        description: "一覧取得"
      - method: "POST"
        endpoint: "/api/media"
        description: "新規登録"
      - method: "DELETE"
        endpoint: "/api/media/[id]"
        description: "削除"

    store_media_urls:
      - method: "GET"
        endpoint: "/api/store-media-urls?store_id=xxx"
        description: "店舗ごとのURL取得"
      - method: "POST"
        endpoint: "/api/store-media-urls"
        description: "登録（UPSERT）"
      - method: "DELETE"
        endpoint: "/api/store-media-urls/[id]"
        description: "削除"

    broadcast:
      - method: "POST"
        endpoint: "/api/broadcast/create"
        description: "Flex Message一括生成・下書き保存"
      - method: "POST"
        endpoint: "/api/broadcast/test"
        description: "テスト配信（開発者へ送信）"
      - method: "GET"
        endpoint: "/api/broadcast/jobs"
        description: "配信履歴一覧"
      - method: "GET"
        endpoint: "/api/broadcast/jobs/[id]"
        description: "配信詳細"

    webhook:
      - method: "POST"
        endpoint: "/api/webhook/[storeId]"
        description: "LINEからのイベント受信（フェーズ2以降）"

  # =====================================
  # 処理フロー: 一括生成
  # =====================================

  broadcast_flow:
    request:
      endpoint: "POST /api/broadcast/create"
      body: |
        {
          "template_id": "xxx",
          "store_ids": ["store1", "store2", ...],
          "media_selections": {
            "store1": "media_id_1",
            "store2": "media_id_2"
          }
        }

    process:
      - "テンプレートJSON取得"
      - "broadcast_jobsにレコード作成（status: 'sending'）"
      - "各店舗ごとにループ"
      - "  - store_media_urlsから該当URLを取得"
      - "  - JSONの {{media_url}} を置換"
      - "  - LINE Messaging APIで下書き保存（または配信）"
      - "  - 成功/失敗をカウント"
      - "broadcast_jobsを更新（status: 'completed' or 'failed'）"
      - "結果を返却"

    response: |
      {
        "job_id": "xxx",
        "status": "completed",
        "sent_count": 5,
        "failed_count": 1,
        "results": [
          { "store_id": "xxx", "store_name": "渋谷店", "success": true },
          { "store_id": "yyy", "store_name": "新宿店", "success": false, "error": "Invalid token" }
        ]
      }

  # =====================================
  # 環境変数
  # =====================================

  environment_variables:
    supabase:
      - name: "NEXT_PUBLIC_SUPABASE_URL"
        description: "SupabaseのProject URL"
        example: "https://xxx.supabase.co"
        client_side: true
      - name: "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        description: "Supabaseのanon key"
        example: "eyJxxx..."
        client_side: true
      - name: "SUPABASE_SERVICE_ROLE_KEY"
        description: "Supabaseのservice role key（サーバーサイドのみ）"
        example: "eyJxxx..."
        client_side: false

    line:
      - name: "LINE_CHANNEL_ACCESS_TOKEN"
        description: "LINEチャネルアクセストークン（テスト用）"
        note: "本番は店舗ごとにDBで管理"
        client_side: false
      - name: "LINE_CHANNEL_SECRET"
        description: "LINEチャネルシークレット"
        client_side: false
      - name: "LINE_TEST_USER_ID"
        description: "テスト配信先のユーザーID"
        example: "Uxxx"
        client_side: false

    app:
      - name: "NEXT_PUBLIC_APP_URL"
        description: "アプリケーションのURL"
        example: "http://localhost:3000"
        client_side: true

  # =====================================
  # 開発ルール・注意事項
  # =====================================

  development_rules:
    rate_limiting:
      description: "LINE Messaging APIにはレート制限がある"
      limits:
        - api: "プッシュメッセージ"
          limit: "2,000リクエスト/秒"
        - api: "リッチメニュー作成"
          limit: "100リクエスト/時"
      countermeasures:
        - "Promise.allで投げっぱなしにしない"
        - "バッチ処理で適度に間隔を空ける"
        - "大量配信時はQueue（Upstash QStash等）の導入を検討"

    error_handling:
      description: "LINE APIからのエラーはHTTPFetchErrorとしてキャッチ"
      code: |
        try {
          await client.pushMessage({ to: userId, messages });
        } catch (error) {
          if (error instanceof HTTPFetchError) {
            console.error('LINE API Error:', error.status, error.body);
          }
          throw error;
        }

    security:
      rules:
        - "Channel Access Token: 絶対にクライアントサイド（ブラウザ）に露出させない"
        - "Webhook署名検証: x-line-signature の検証は必須"
        - "RLS: Supabaseのテーブルには適切なRLSポリシーを設定（フェーズ2以降）"

  # =====================================
  # テストデータ
  # =====================================

  test_data:
    stores:
      - name: "テスト店舗A（渋谷）"
        usage: "開発検証用"
      - name: "テスト店舗B（新宿）"
        usage: "開発検証用"
      - name: "テスト店舗C（池袋）"
        usage: "開発検証用"

    media:
      - name: "ホットペッパー"
        usage: "予約URL"
      - name: "食べログ"
        usage: "予約URL"
      - name: "Instagram"
        usage: "SNSリンク"
      - name: "Google Map"
        usage: "地図リンク"

    sample_flex_message: |
      {
        "type": "bubble",
        "hero": {
          "type": "image",
          "url": "https://placehold.jp/800x600.png",
          "size": "full",
          "aspectRatio": "4:3",
          "aspectMode": "cover"
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "新メニュー登場！",
              "weight": "bold",
              "size": "xl"
            },
            {
              "type": "text",
              "text": "期間限定でお得なメニューをご用意しました。ぜひご来店ください！",
              "size": "sm",
              "color": "#666666",
              "margin": "md",
              "wrap": true
            }
          ]
        },
        "footer": {
          "type": "box",
          "layout": "vertical",
          "spacing": "sm",
          "contents": [
            {
              "type": "button",
              "style": "primary",
              "action": {
                "type": "uri",
                "label": "予約はこちら",
                "uri": "{{media_url}}"
              }
            }
          ]
        }
      }