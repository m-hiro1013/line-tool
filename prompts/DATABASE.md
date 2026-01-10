-- ========================================
-- 店舗マスタ
-- ========================================
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  line_channel_id TEXT,
  line_channel_secret TEXT,
  line_channel_access_token TEXT NOT NULL,
  webhook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ========================================
-- Flex Messageテンプレート
-- ========================================
CREATE TABLE templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  json_content JSONB NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ========================================
-- 媒体マスタ
-- ========================================
CREATE TABLE media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ========================================
-- 店舗×媒体URL
-- ========================================
CREATE TABLE store_media_urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(store_id, media_id)
);

-- ========================================
-- 配信ジョブ（履歴管理）
-- ========================================
CREATE TABLE broadcast_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  target_store_ids UUID[] NOT NULL,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  error_details JSONB,
  x_line_request_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- ========================================
-- updated_at自動更新用のトリガー関数
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;

$$ language 'plpgsql';

-- stores
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- templates
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- store_media_urls
CREATE TRIGGER update_store_media_urls_updated_at
  BEFORE UPDATE ON store_media_urls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
実行して「Success」と表示されたら教えてください！

Notionに保存
DATABASE.md
28.80 KB
テーブル作成完了したら 以下を参考に このプロジェクト固有の database.mdを作成してね
いいですね！テーブル作成完了したんですね。

では、このLINE運用効率化ツール用の database.md を作成しますね。

📁 対象ファイル: DATABASE.md（プロジェクトルートに新規作成） 📝 変更内容: 新規作成

Copy# =====================================
# 🗄️ DATABASE.md
# =====================================
#
# 【このファイルの役割】
# データベースの設計（テーブル定義・カラム・リレーション）を記録するドキュメント。
# プロジェクトの「データ構造がどうなっているか」の正（Single Source of Truth）。
# 実際のSupabaseのテーブルとこのファイルの内容は常に一致している必要がある。
#
# 【このファイルを更新するタイミング】
# - 新しいテーブルを作成したとき
# - 既存テーブルにカラムを追加したとき
# - カラムの型や制約を変更したとき
# - 外部キーを追加・変更・削除したとき
# - RLSポリシーを追加・変更したとき
# ※ DBに変更を加えたら必ずこのファイルも更新する
#
# =====================================

> ⚠️ このファイルはプロジェクトのデータベース設計の「正」です
> テーブル変更時は必ずここを更新してください

---

## 📋 基本情報

| 項目 | 値 |
|------|-----|
| データベース | Supabase (PostgreSQL) |
| 最終更新日 | 2026-01-09 |
| 更新者 | - |

---

## 📊 テーブル一覧

| テーブル名 | 説明 | RLS |
|-----------|------|-----|
| stores | 店舗マスタ（LINE認証情報含む） | ❌ |
| templates | Flex Messageテンプレート | ❌ |
| media | 媒体マスタ（ホットペッパー等） | ❌ |
| store_media_urls | 店舗×媒体URL | ❌ |
| broadcast_jobs | 配信ジョブ（履歴管理） | ❌ |

---

## 🗂️ テーブル詳細

### ① stores（店舗マスタ）

**概要**: 店舗ごとのLINE認証情報を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主キー |
| name | TEXT | NOT NULL | 店舗名 |
| line_channel_id | TEXT | | Channel ID |
| line_channel_secret | TEXT | | Webhook署名検証用 |
| line_channel_access_token | TEXT | NOT NULL | 長期チャネルアクセストークン |
| webhook_url | TEXT | | 設定済みWebhook URL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 更新日時 |

**RLSポリシー**: なし（フェーズ1は認証なし）

**トリガー**: `update_stores_updated_at` - 更新時にupdated_atを自動更新

**備考**:
- line_channel_access_tokenは必須（LINE配信に必要）
- line_channel_id, line_channel_secretはWebhook受信時に使用（フェーズ2）

---

### ② templates（Flex Messageテンプレート）

**概要**: 配信用のメッセージひな形

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主キー |
| name | TEXT | NOT NULL | テンプレート名 |
| json_content | JSONB | NOT NULL | Flex MessageのJSON本体 |
| thumbnail_url | TEXT | | プレビュー画像URL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 更新日時 |

**RLSポリシー**: なし（フェーズ1は認証なし）

**トリガー**: `update_templates_updated_at` - 更新時にupdated_atを自動更新

**備考**:
- json_contentにはFlex Message Simulator互換のJSONを保存
- `{{media_url}}` などのプレースホルダーを含む
- thumbnail_urlは管理画面でのプレビュー用（任意）

---

### ③ media（媒体マスタ）

**概要**: 予約媒体（ホットペッパー、食べログ等）を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主キー |
| name | TEXT | NOT NULL, UNIQUE | 媒体名 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 作成日時 |

**RLSポリシー**: なし（フェーズ1は認証なし）

**備考**:
- 媒体名は重複不可（UNIQUE制約）
- 例：ホットペッパー、食べログ、Instagram、Google Map

---

### ④ store_media_urls（店舗×媒体URL）

**概要**: 店舗ごとの各媒体URLを管理。テンプレート内の `{{media_url}}` を置換するデータ

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主キー |
| store_id | UUID | NOT NULL, FK → stores(id) ON DELETE CASCADE | 店舗ID |
| media_id | UUID | NOT NULL, FK → media(id) ON DELETE CASCADE | 媒体ID |
| url | TEXT | NOT NULL | URL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 更新日時 |

**RLSポリシー**: なし（フェーズ1は認証なし）

**トリガー**: `update_store_media_urls_updated_at` - 更新時にupdated_atを自動更新

**制約**:
- UNIQUE(store_id, media_id) - 同じ店舗×媒体の組み合わせは1件のみ

**備考**:
- 店舗削除時は関連URLも削除（CASCADE）
- 媒体削除時は関連URLも削除（CASCADE）

---

### ⑤ broadcast_jobs（配信ジョブ）

**概要**: 一括配信の履歴とステータス管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主キー |
| template_id | UUID | FK → templates(id) ON DELETE SET NULL | テンプレートID |
| status | TEXT | NOT NULL, DEFAULT 'pending' | ステータス |
| target_store_ids | UUID[] | NOT NULL | 配信対象店舗ID配列 |
| sent_count | INTEGER | DEFAULT 0 | 成功数 |
| failed_count | INTEGER | DEFAULT 0 | 失敗数 |
| error_details | JSONB | | エラー詳細 |
| x_line_request_id | TEXT | | LINE問い合わせ用ID |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 配信日時 |
| completed_at | TIMESTAMPTZ | | 完了日時 |

**RLSポリシー**: なし（フェーズ1は認証なし）

**備考**:
- status: `pending` → `sending` → `completed` / `failed`
- テンプレート削除時もジョブ履歴は残る（SET NULL）
- error_detailsには店舗ごとのエラー情報をJSON形式で保存
- x_line_request_idはLINEサポートへの問い合わせ時に使用

---

## 🔗 リレーション

### 外部キー一覧

| FROM テーブル | FROM カラム | TO テーブル | TO カラム | ON DELETE |
|--------------|-------------|-------------|-----------|-----------|
| store_media_urls | store_id | stores | id | CASCADE |
| store_media_urls | media_id | media | id | CASCADE |
| broadcast_jobs | template_id | templates | id | SET NULL |

### リレーション図

stores media (店舗マスタ) (媒体マスタ) │ │ │ id │ id │ │ └──────────┬───────────────┘ │ ▼ store_media_urls (店舗×媒体URL)

templates ─────────────► broadcast_jobs (テンプレート) (配信ジョブ) template_id


---

## 🛠️ Functions / Triggers

### Functions

| 関数名 | 説明 |
|--------|------|
| update_updated_at_column() | updated_atカラムを現在時刻に更新するトリガー関数 |

### Triggers

| トリガー名 | テーブル | タイミング | 説明 |
|-----------|---------|-----------|------|
| update_stores_updated_at | stores | BEFORE UPDATE | updated_at自動更新 |
| update_templates_updated_at | templates | BEFORE UPDATE | updated_at自動更新 |
| update_store_media_urls_updated_at | store_media_urls | BEFORE UPDATE | updated_at自動更新 |

---

## 🗄️ ストレージバケット

なし（フェーズ1では画像等のストレージは使用しない）

---

## 🔑 RLSポリシー設計方針

### 基本ルール

- フェーズ1: RLSなし（管理者のみ使用のため）
- フェーズ2以降: Supabase Authで認証追加、user_id列を追加してRLS有効化予定

---

## 📝 変更履歴

| 日付 | 変更内容 | 理由 |
|------|---------|------|
| 2026-01-09 | 初期5テーブル作成（stores, templates, media, store_media_urls, broadcast_jobs） | 初期設計 |
| 2026-01-09 | update_updated_at_column関数、各テーブルのトリガー作成 | updated_at自動更新対応 |

---

## 💡 補足・注意事項

- フェーズ1は認証なしのため、RLSは無効
- Channel Access Tokenは絶対にクライアントサイドに露出させない（サーバーサイドのみで使用）
- テンプレートのjson_contentは、LINE Flex Message Simulatorで作成したJSONをそのまま保存可能
- `{{media_url}}` などのプレースホルダーは配信時にstore_media_urlsの値で置換
- 将来的に `{{store_name}}` など他の変数も対応予定（store_variablesテーブル追加）