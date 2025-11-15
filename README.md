# 開発

Nuxt 4.x + Supabase で構成されています。

- Node.js は 20.x 以上が必要
- 依存関係は pnpm で管理

## Nuxt を起動するまで

Voltaなどでpnpmを入れる。

```sh
volta install pnpm
```

依存関係のインストール

```sh
pnpm i
```

開発サーバーの起動

```sh
pnpm dev
```

テスト

```sh
pnpm vitest run
```

サーバーAPIの実装方針については `docs/server-architecture.md` を参照。

eslint

```sh
pnpm lint
pnpm lint:fix
```

## Supabase CLIの設定

Supabase CLIを使ってローカルにSupabaseを起動する。
Docker が必要なので、OSごとに適宜以下のようなものを使って環境を作っておく。

- Windows: WSL2 + Docker Desktop or Docker Engine
- macOS: Docker Desktop for Mac

[これ](https://supabase.com/docs/guides/local-development?queryGroups=package-manager&package-manager=pnpm)を読んでおく。

### Supabase を起動する

初回はinitする。

```sh
pnpx supabase init
```

起動

```sh
pnpx supabase start
```

### 開発のためにやること

#### 環境変数の設定

リポジトリルートに `.env` を作る。

- @nuxtjs/supabaseを使うため、URLと(anon)キーを書く。
- Drizzleが使う `DATABASE_URL` に Supabase Postgres 接続文字列を設定する。
- Googleでのログインを使う場合、GCPでローカル用に OAuth 2.0 クライアント ID を作成しておく。
  - 反映するため再起動 `pnpx supabase stop && pnpx supabase start` が必要

```
SUPABASE_URL=http://localhost:54321
SUPABASE_KEY=xxx
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
SUPABASE_AUTH_GOOGLE_CLIENT_ID=xxx
SUPABASE_AUTH_GOOGLE_SECRET=xxx
```

#### DBの初期化・再作成

```sh
pnpx supabase db reset
```

## データベース運用

マイグレーション作成
- supabase/ にある Drizzle スキーマを更新して `pnpm db:generate --name=<snake_case_summary>` を実行して SQL を生成する。
- Supabase CLI で反映する場合は `pnpx supabase db reset` や `pnpx supabase db push` を使い、生成された SQL から離れた手書き変更は避ける。

制約・インデックス命名規則
- ユニーク制約: `uq_<table>__<col1>_<col2>`
- インデックス: `idx_<table>__<col1>_<col2>`
- 外部キー: `fk_<from_table>__<to_table>`

型生成フロー
- サーバーサイドでは Drizzle の型を利用する。
- フロントや Supabase クライアントで型補完が必要な場合だけ `pnpx supabase gen types` で `types/database.types.ts` を更新する。

```sh
pnpx supabase gen types typescript --local > types/database.types.ts && pnpm lint:fix
```
