# setup.md - 環境構築・事前準備手順

## 概要

飲食店LINE運用効率化ツールの開発を始める前に必要なアカウント作成、環境構築、および初期設定手順をまとめたドキュメント。

このドキュメントに沿って進めれば、開発を始められる状態が整います。

---

## 事前準備チェックリスト

### アカウント作成
- [ ] LINE Developersアカウント
- [ ] Supabaseアカウント
- [ ] GitHubアカウント
- [ ] Vercelアカウント

### ローカル環境構築
- [ ] Node.js インストール（v18以上）
- [ ] Git インストール
- [ ] VS Code インストール（推奨）
- [ ] VS Code 拡張機能インストール

### LINE Developers設定
- [ ] プロバイダー作成
- [ ] Messaging APIチャネル作成
- [ ] チャネルアクセストークン発行
- [ ] 応答設定の変更

### Supabase設定
- [ ] プロジェクト作成
- [ ] Project URL取得
- [ ] anon key取得
- [ ] テーブル作成

### プロジェクト作成
- [ ] Next.jsプロジェクト作成
- [ ] 必要なライブラリインストール
- [ ] 環境変数設定
- [ ] 動作確認（localhost:3000）

### テストデータ準備
- [ ] テスト店舗情報（2〜3店舗分）
- [ ] テスト用媒体URL
- [ ] サンプルFlex Message JSON

---

## 1. アカウント作成

### 1-1. LINE Developers

**URL**: https://developers.line.biz/

| 手順 | 操作 |
|-----|------|
| 1 | 「ログイン」をクリック |
| 2 | 普段使っているLINEアカウントでログイン |
| 3 | 開発者情報を登録（名前、メールアドレス） |
| 4 | 利用規約に同意して登録完了 |

---

### 1-2. Supabase

**URL**: https://supabase.com/

| 手順 | 操作 |
|-----|------|
| 1 | 「Start your project」をクリック |
| 2 | 「Continue with GitHub」でGitHubアカウント連携 |
| 3 | 認証を許可して登録完了 |

---

### 1-3. GitHub

**URL**: https://github.com/

※既にアカウントがあればスキップ

| 手順 | 操作 |
|-----|------|
| 1 | 「Sign up」をクリック |
| 2 | メールアドレス、パスワード、ユーザー名を入力 |
| 3 | メール認証して登録完了 |

---

### 1-4. Vercel

**URL**: https://vercel.com/

| 手順 | 操作 |
|-----|------|
| 1 | 「Sign Up」をクリック |
| 2 | 「Continue with GitHub」を選択 |
| 3 | GitHubアカウントで認証して登録完了 |

---

## 2. ローカル環境構築

### 2-1. Node.js インストール

**URL**: https://nodejs.org/

| 手順 | 操作 |
|-----|------|
| 1 | LTS版（推奨版）をダウンロード |
| 2 | インストーラーを実行 |
| 3 | デフォルト設定でインストール |

**確認コマンド:**
```bash
node -v
# v18.x.x 以上が表示されればOK

npm -v
# 9.x.x 以上が表示されればOK
2-2. Git インストール
URL: https://git-scm.com/

手順	操作
1	ダウンロードページからOS別インストーラーを取得
2	インストーラーを実行
3	デフォルト設定でインストール
確認コマンド:

Copygit -v
# git version 2.x.x が表示されればOK
初期設定（必須）:

Copygit config --global user.name "あなたの名前"
git config --global user.email "your-email@example.com"
2-3. VS Code インストール
URL: https://code.visualstudio.com/

ダウンロードしてインストール。

推奨拡張機能:

拡張機能	用途	必須度
ESLint	コード品質チェック	★★★
Prettier	コードフォーマット	★★★
Tailwind CSS IntelliSense	Tailwind補完	★★★
ES7+ React/Redux/React-Native snippets	Reactスニペット	★★☆
Auto Rename Tag	HTMLタグ自動リネーム	★★☆
GitLens	Git履歴の可視化	★☆☆
拡張機能のインストール方法:

VS Code左サイドバーの拡張機能アイコン（四角4つ）をクリック
検索ボックスに拡張機能名を入力
「Install」をクリック
3. LINE Developers設定
3-1. プロバイダー作成
URL: https://developers.line.biz/console/

手順	操作
1	LINE Developersコンソールにログイン
2	「新規プロバイダー作成」をクリック
3	プロバイダー名を入力（例：「自分の名前」や「会社名」）
4	「作成」をクリック
3-2. Messaging APIチャネル作成
手順	操作
1	作成したプロバイダーを選択
2	「新規チャネル作成」をクリック
3	「Messaging API」を選択
4	必要項目を入力（下表参照）
5	利用規約に同意して「作成」
入力項目:

項目	入力内容	備考
チャネル名	Dev-Restaurant-Bot	任意（後から変更可）
チャネル説明	開発テスト用	任意
大業種	飲食・レストラン（または該当するもの）	
小業種	該当するものを選択	
メールアドレス	自分のメールアドレス	
3-3. チャネルアクセストークン発行
作成したチャネルの管理画面から以下の情報を取得。

チャネル基本設定タブ:

項目	場所
Channel ID	ページ上部に表示
Channel Secret	「チャネルシークレット」欄
Messaging API設定タブ:

項目	操作
Channel Access Token	ページ下部「チャネルアクセストークン（長期）」の「発行」をクリック
⚠️ 重要: 発行されたトークンは必ずコピーして安全な場所に保存してください。

3-4. 応答設定の変更
「Messaging API設定」タブで以下を設定:

項目	設定値	理由
応答メッセージ	無効	ボットの自動応答と競合するため
あいさつメッセージ	無効（推奨）	開発中は不要
Webhookの利用	有効	イベント受信に必要
Webhook URL	空欄（後で設定）	Vercelデプロイ後に設定
3-5. Webhook設定（デプロイ後に実施）
※Vercelへのデプロイ完了後に設定します。現時点ではスキップ。

手順	操作
1	「Messaging API設定」タブを開く
2	「Webhook URL」に本番URLを入力
3	「検証」ボタンで疎通確認
4	「Webhookの利用」がONになっていることを確認
Webhook URL形式:

https://your-app.vercel.app/api/webhook/[storeId]
4. Supabase設定
4-1. プロジェクト作成
URL: https://app.supabase.com/

手順	操作
1	Supabaseダッシュボードにログイン
2	「New Project」をクリック
3	必要項目を入力（下表参照）
4	「Create new project」をクリック
5	数分待って作成完了
入力項目:

項目	入力内容	備考
Name	line-restaurant-tool	任意
Database Password	強力なパスワード	必ず保存しておく
Region	Northeast Asia (Tokyo)	日本からのアクセス用
Pricing Plan	Free	開発には十分
4-2. API情報取得
プロジェクト作成完了後:

手順	操作
1	左メニュー「Project Settings」をクリック
2	「API」を選択
3	以下の情報をコピーして保存
取得する情報:

項目	説明	例
Project URL	APIのベースURL	https://xxxxx.supabase.co
anon public key	公開用APIキー	eyJhbGciOiJIUzI1NiIsInR5cCI6...
4-3. テーブル作成
左メニュー「SQL Editor」で以下のSQLを実行:

Copy-- ========================================
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
「Run」をクリックして実行。

確認方法: 左メニュー「Table Editor」で5つのテーブルが作成されていればOK。

5. プロジェクトセットアップ（ローカル）
5-1. Next.jsプロジェクト作成
ターミナルで以下を実行:

Copynpx create-next-app@latest line-restaurant-tool --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
選択肢が出た場合:

質問	回答
Would you like to use TypeScript?	Yes
Would you like to use ESLint?	Yes
Would you like to use Tailwind CSS?	Yes
Would you like to use src/ directory?	Yes
Would you like to use App Router?	Yes
Would you like to customize the default import alias?	Yes → @/*
5-2. ディレクトリ移動
Copycd line-restaurant-tool
5-3. 必要なライブラリインストール
Copy# Supabaseクライアント
npm install @supabase/supabase-js @supabase/ssr

# LINE Bot SDK
npm install @line/bot-sdk

# UI関連（shadcn/ui用）
npm install class-variance-authority clsx tailwind-merge lucide-react

# shadcn/ui初期化
npx shadcn@latest init
shadcn/ui初期化時の選択:

質問	回答
Which style would you like to use?	Default
Which color would you like to use as base color?	Slate
Would you like to use CSS variables for colors?	Yes
5-4. 環境変数設定
プロジェクトルートに .env.local ファイルを作成:

Copytouch .env.local
以下の内容を記述:

# ========================================
# Supabase
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# ========================================
# LINE（テスト用 - 本番は店舗ごとにDBで管理）
# ========================================
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret

# ========================================
# アプリケーション
# ========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
⚠️ 注意: .env.local は .gitignore に含まれているため、GitHubにはpushされません。

5-5. 動作確認
Copynpm run dev
ブラウザで http://localhost:3000 にアクセス。 Next.jsの初期画面が表示されれば環境構築完了！

6. GitHubリポジトリ作成・連携
6-1. GitHubでリポジトリ作成
手順	操作
1	GitHub（https://github.com）にログイン
2	右上の「+」→「New repository」
3	Repository name: line-restaurant-tool
4	Private を選択（推奨）
5	「Create repository」をクリック
6-2. ローカルとGitHubを連携
Copy# 初期コミット
git add .
git commit -m "chore: initial commit"

# リモートリポジトリ追加
git remote add origin https://github.com/YOUR_USERNAME/line-restaurant-tool.git

# プッシュ
git branch -M main
git push -u origin main
7. テストデータ準備
7-1. テスト店舗情報
開発時に使うダミーデータを用意。

店舗名	用途
テスト店舗A（渋谷）	開発検証用
テスト店舗B（新宿）	開発検証用
テスト店舗C（池袋）	開発検証用
※LINEチャネルアクセストークンは、テスト用に1つ取得したものを使い回してOK

7-2. テスト用媒体
媒体名	用途
ホットペッパー	予約URL
食べログ	予約URL
Instagram	SNSリンク
Google Map	地図リンク
7-3. テスト用媒体URL
媒体	ダミーURL
ホットペッパー	https://www.hotpepper.jp/strXXXXXX/
食べログ	https://tabelog.com/tokyo/AXXXXXX/
Instagram	https://www.instagram.com/test_store/
Google Map	https://maps.google.com/?q=test
※実際のURLでなくてもOK、形式が正しければ開発は進められる

7-4. サンプルFlex Message JSON
Flex Message Simulator: https://developers.line.biz/flex-message-simulator/

以下は {{media_url}} を含むシンプルなサンプル:

Copy{
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
ポイント:

{{media_url}} がツールで店舗ごとのURLに置換される部分
Flex Message Simulatorで見た目を確認しながら編集可能
8. 取得情報まとめテンプレート
以下をコピーして、自分用にメモしておく:

========================================
LINE Developers
========================================
チャネルID: 
チャネルシークレット: 
チャネルアクセストークン: 
Bot友だち追加URL: https://line.me/R/ti/p/@xxx

========================================
Supabase
========================================
Project URL: https://xxxxx.supabase.co
anon public key: eyJxxx...
Database Password: （安全な場所に保管）

========================================
GitHub
========================================
リポジトリURL: https://github.com/YOUR_USERNAME/line-restaurant-tool

========================================
Vercel（デプロイ後に追記）
========================================
本番URL: https://xxx.vercel.app
9. 環境構築完了チェックリスト
すべてにチェックが入れば、開発スタート準備完了！

アカウント
 LINE Developersアカウント作成完了
 Supabaseアカウント作成完了
 GitHubアカウント作成完了
 Vercelアカウント作成完了
LINE Developers
 プロバイダー作成完了
 Messaging APIチャネル作成完了
 チャネルアクセストークン発行・保存完了
 応答設定変更完了（応答メッセージ：無効）
Supabase
 プロジェクト作成完了
 API情報取得・保存完了
 テーブル作成完了（5テーブル）
ローカル環境
 Node.js v18以上インストール完了
 Git インストール・初期設定完了
 VS Code インストール完了
 推奨拡張機能インストール完了
プロジェクト
 Next.jsプロジェクト作成完了
 ライブラリインストール完了
 .env.local 設定完了
 npm run dev で起動確認完了
 GitHubリポジトリ作成・push完了
テストデータ
 サンプルFlex Message JSON用意完了
10. 次のステップ
環境構築が完了したら、以下の順で実装を進めます:

Step 1: 基盤実装
src/lib/supabase/client.ts - Supabaseクライアント（ブラウザ用）
src/lib/supabase/server.ts - Supabaseクライアント（サーバー用）
src/lib/line/client.ts - LINE SDKラッパー
src/types/index.ts - 型定義
Step 2: API実装
/api/stores - 店舗CRUD
/api/templates - テンプレートCRUD
/api/media - 媒体CRUD
/api/store-media-urls - 店舗×媒体URL CRUD
/api/broadcast/create - 一括配信
Step 3: 画面実装
ダッシュボード
店舗管理画面
テンプレート管理画面
媒体管理画面
配信作成画面
11. 次回セッションの準備
持ってくるもの
 このドキュメント（setup.md）
 project.md
 persona.md
 取得した各種キー・URL（メモ）
伝えること
環境構築完了しました。
Flex Message一括作成機能の実装を始めたいです。
参考リンク
アカウント・サービス
サービス	URL
LINE Developers	https://developers.line.biz/
LINE Developersコンソール	https://developers.line.biz/console/
Supabase	https://supabase.com/
Supabaseダッシュボード	https://app.supabase.com/
Vercel	https://vercel.com/
GitHub	https://github.com/
開発ツール
ツール	URL
Flex Message Simulator	https://developers.line.biz/flex-message-simulator/
Node.js	https://nodejs.org/
Git	https://git-scm.com/
VS Code	https://code.visualstudio.com/
ドキュメント
ドキュメント	URL
LINE Messaging API	https://developers.line.biz/ja/docs/messaging-api/
Supabase公式ドキュメント	https://supabase.com/docs
Next.js公式ドキュメント	https://nextjs.org/docs
Tailwind CSS	https://tailwindcss.com/docs
shadcn/ui	https://ui.shadcn.com/

---

## 統合時の変更点まとめ

**構造の改善**
- 全セクションに手順番号と表を追加して見やすく
- チェックリストを冒頭と完了確認用の2箇所に配置
- 順序を論理的に整理（アカウント→環境→LINE→Supabase→プロジェクト）

**追加した内容**
- VS Code拡張機能に必須度を追加
- LINE応答設定の変更手順を追加
- Supabase SQL にトリガー関数（updated_at自動更新）を追加
- broadcast_jobsテーブルを追加
- shadcn/ui初期化手順を追加
- GitHubリポジトリ作成・連携手順を追加
- 環境構築完了チェックリストを追加
- 次のステップ（実装順序）を追加

**整理した内容**
- 重複していた内容を統合
- テーブル形式を統一
- 確認コマンドと期待する出力を明確化
- 参考リンクをカテゴリ分け