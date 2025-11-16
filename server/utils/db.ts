import { sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import { createError } from "h3";
import postgres from "postgres";

import * as schema from "~~/supabase/schema";

export const tables = schema;

export type DrizzleClient = PostgresJsDatabase<typeof schema>;
export type DrizzleTransactionClient = Parameters<Parameters<DrizzleClient["transaction"]>[0]>[0];
export type DrizzleQueryClient = DrizzleClient | DrizzleTransactionClient;

let db: DrizzleClient | null = null;

function createDrizzle(): DrizzleClient {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  db = drizzle(postgres(url, { prepare: false }), { schema, casing: "snake_case" });

  return db;
}

export function getDrizzleClient(): DrizzleClient {
  return db ?? createDrizzle();
}

type JwtClaims = {
  sub: string;
  role?: string;
  [key: string]: unknown;
};

function decodeAccessToken(token: string): JwtClaims {
  const segments = token.split(".");
  if (segments.length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid access token",
    });
  }

  let claims: JwtClaims;
  try {
    const payload = Buffer.from(segments[1]!, "base64url").toString("utf8");
    claims = JSON.parse(payload) as JwtClaims;
  }
  catch {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid JWT format",
    });
  }

  if (!claims.sub) {
    throw createError({
      statusCode: 400,
      statusMessage: "JWT is missing sub claim",
    });
  }

  return claims;
}

async function applyJwtClaims(dbClient: DrizzleTransactionClient, claims: JwtClaims, token: string) {
  await dbClient.execute(sql`select set_config('request.jwt.claims', ${JSON.stringify(claims)}, true)`);
  await dbClient.execute(sql`select set_config('request.jwt.claim.sub', ${claims.sub}, true)`);

  if (claims.role && typeof claims.role === "string") {
    await dbClient.execute(sql`select set_config('request.jwt.claim.role', ${claims.role}, true)`);
  }

  if (claims.email && typeof claims.email === "string") {
    await dbClient.execute(sql`select set_config('request.jwt.claim.email', ${claims.email}, true)`);
  }

  await dbClient.execute(sql`select set_config('request.jwt', ${token}, true)`);
  const role = (claims.role as string | undefined) ?? "authenticated";
  await dbClient.execute(sql`set local role ${sql.identifier(role)}`);
}

async function resetJwtClaims(dbClient: DrizzleTransactionClient) {
  await dbClient.execute(sql`select set_config('request.jwt.claims', null, true)`);
  await dbClient.execute(sql`select set_config('request.jwt.claim.sub', null, true)`);
  await dbClient.execute(sql`select set_config('request.jwt.claim.role', null, true)`);
  await dbClient.execute(sql`select set_config('request.jwt.claim.email', null, true)`);
  await dbClient.execute(sql`select set_config('request.jwt', null, true)`);
  await dbClient.execute(sql`reset role`);
}

type TransactionArgs = Parameters<DrizzleClient["transaction"]>;
type TransactionHandler = TransactionArgs[0];

export function createSupabaseDrizzle(accessToken: string) {
  const client = getDrizzleClient();
  const claims = decodeAccessToken(accessToken);

  const rls = (async (transaction, ...rest) => {
    const handler = transaction as TransactionHandler;

    return client.transaction(async (tx) => {
      await applyJwtClaims(tx, claims, accessToken);

      let handlerResult: Awaited<ReturnType<TransactionHandler>> | undefined;
      let handlerError: unknown;
      let resetError: unknown;

      try {
        handlerResult = await handler(tx);
      }
      catch (error) {
        handlerError = error;
      }

      try {
        await resetJwtClaims(tx);
      }
      catch (error) {
        console.error("Failed to reset JWT claims", error);
        resetError = error;
      }

      if (handlerError) {
        throw handlerError;
      }

      if (resetError) {
        throw resetError;
      }

      return handlerResult as Awaited<ReturnType<TransactionHandler>>;
    }, ...rest);
  }) as DrizzleClient["transaction"];

  return {
    admin: client,
    rls,
  };
}
