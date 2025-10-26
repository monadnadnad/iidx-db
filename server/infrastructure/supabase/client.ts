import { serverSupabaseClient } from "#supabase/server";

import type { Database } from "~~/types/database.types";

export type SupabaseClient = Awaited<ReturnType<typeof serverSupabaseClient<Database>>>;
