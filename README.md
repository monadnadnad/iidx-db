# 開発

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

## Supabaseの設定

起動

```sh
pnpx supabase start
```

.envを書く。

```
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_KEY=xxx
```

DBの初期化

```sh
pnpx supabase db reset
```

型の生成

```sh
pnpx supabase gen types typescript --local > types/database.types.ts
pnpm run format
```
