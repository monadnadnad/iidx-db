# Drizzle × Supabase Schema Rules

This project keeps Postgres/Supabase schema changes consistent by following the rules below. Update this document if the conventions change.

1. **Use Supabase helpers**  
   - Import `authUid`, `authUsers`, and role constants from `drizzle-orm/supabase`.  
   - Reference Supabase auth tables via `authUsers` so FKs stay in sync with the managed `auth.users` table.

2. **Centralize auth predicates**  
   - Define a single helper such as `const ownsRowOf = (column) => sql\`\${authUid} IS NOT NULL AND \${column} = \${authUid}\``.  
   - Reuse that helper for every ownership-based policy; never inline `auth.uid()` comparisons.

3. **RLS policies and metadata**  
   - We explicitly call `.enableRLS()` on every table definition because Supabase’s migration metadata (`meta/*_snapshot.json`) otherwise keeps flipping `"isRLSEnabled"` back to `false`, even though the generated SQL enables RLS.  
   - This workaround keeps the schema, generated SQL, and Supabase metadata in sync. Make sure each table also defines every required `pgPolicy` entry inside the `pgTable` config array so Drizzle still emits the relevant `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` statements.

4. **Default values and ownership**  
   - Column defaults must call `auth.uid()` directly (e.g., `default(sql\`auth.uid()\`)`) because Postgres forbids subqueries in `DEFAULT`.  
   - Policies should check both authentication and ownership: `ownsRowOf(table.userId)` ensures unauthenticated requests are rejected early.
