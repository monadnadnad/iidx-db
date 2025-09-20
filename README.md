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

## Supabaseの設定

起動

```sh
pnpx supabase start
```

DBの初期化

```sh
pnpx supabase db reset
```

.envを書く。anon keyは`pnpx supabase status`で見る。

```
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=xxx
```

型の生成

```sh
pnpx supabase gen types typescript --local > ./types/schema.ts
pnpm run format
```
