# 開発

Voltaなどでpnpmを入れる。

```sh
volta install pnpm
```

依存関係のインストール

```sh
pnpm i
```

## Supabaseの設定

起動

```sh
pnpx supabase start
```

DBの初期化

```
pnpx supabase db reset
```

.envを書く。anon keyは`pnpx supabase status`で見る。

```
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=xxx
```