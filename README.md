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

eslint

```sh
pnpm lint
pnpm lint:fix
```

## Supabase CLIの設定

ローカルにSupabaseを起動するため [これ](https://supabase.com/docs/guides/local-development?queryGroups=package-manager&package-manager=pnpm)を読んでおく。

Docker 上で動作するため、OSごとに別途以下のものが必要

- Windows：Docker Desktop + WSL2
- macOS：Docker Desktop for Mac

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
- Googleでのログインを使う場合、GCPでローカル用に OAuth 2.0 クライアント ID を作成しておく。
  - 反映するため再起動 `pnpx supabase stop && pnpx supabase start` が必要

```
SUPABASE_URL=http://localhost:54321
SUPABASE_KEY=xxx
SUPABASE_AUTH_GOOGLE_CLIENT_ID=xxx
SUPABASE_AUTH_GOOGLE_SECRET=xxx
```

#### DBの初期化・再作成

```sh
pnpx supabase db reset
```

#### 型の生成

DBに変更を加えた場合、スキーマの型を更新する。

```sh
pnpx supabase gen types typescript --local > types/database.types.ts && pnpm lint --fix
```
