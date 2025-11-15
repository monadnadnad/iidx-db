# Server API architecture

## Data layer

- `supabase/schema.ts` is the single source of truth for Drizzle models; repositories must import tables via `tables` from `server/utils/db`.
- `server/infrastructure/drizzle/*Repository.ts` hosts all SQL. API routes should only pass validated inputs into these repositories.

## Database clients

- `getDrizzleClient()` returns the shared Postgres connection that uses the service connection string. Use this only for read paths or admin tasks that do not rely on Row-Level Security. Typical examples are public GET endpoints that merely fetch data.
- `createSupabaseDrizzle(accessToken)` wraps the shared client in an RLS-aware transaction runner. It decodes the Supabase JWT, calls `set_config('request.jwt.claim.*')`, issues `set local role ...`, and resets the session afterward. Any handler that expects `auth.uid()` defaults or Supabase RLS (e.g., inserts/updates/deletes on user-owned tables) must execute its repository calls inside `drizzle.rls(async tx => ...)`.
- The helper exposes both `admin` (raw client) and `rls` (transaction wrapper). Prefer `rls` unless you explicitly need cross-user access.

## API handler workflow

1. Fetch the Supabase session with `serverSupabaseClient(event).auth.getSession()` and throw 401 when missing.
2. Validate incoming payloads or query params with Zod schemas from `server/domain/**`.
3. Choose the appropriate DB helper:
   - `const db = getDrizzleClient();` for public read endpoints.
   - `const drizzle = createSupabaseDrizzle(session.access_token); await drizzle.rls(tx => ...)` for anything that writes or relies on RLS-protected reads.
4. Instantiate the repository using the client/transaction and call the relevant method.

Following this pattern keeps business logic isolated in repositories while preserving Supabase’s security guarantees when interacting with the database directly.
