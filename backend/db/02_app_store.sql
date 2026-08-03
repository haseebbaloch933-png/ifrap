-- App persistence seam store (pilot Postgres migration).
--
-- Backs lib/server/pg-store.ts — the Postgres adapter behind the getAll/insert/
-- update/transaction seam used by the Next.js API routes (GRM tickets, field
-- logs, usufruct certificates). The adapter also creates these idempotently at
-- runtime (CREATE TABLE IF NOT EXISTS), so applying this file is optional but
-- recommended so the schema is explicit and reviewable.
--
-- This is the pragmatic pilot store: a generic JSONB collection table. Mapping
-- these collections onto the normalized LADM schema in init_schema.sql
-- (la_party / la_rrr / qualitative_field_logs / ...) is the production-phase
-- follow-up; both coexist in the same database.

-- One row per record, keyed by (collection, id). `ord` reproduces the file
-- store's array ordering: getAll() returns ORDER BY ord ASC and insert()
-- prepends with a smaller ord (matching the file store's unshift()).
CREATE TABLE IF NOT EXISTS app_store (
    collection  text        NOT NULL,
    id          text        NOT NULL,
    ord         bigint      NOT NULL,
    data        jsonb       NOT NULL,
    updated_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (collection, id)
);

CREATE INDEX IF NOT EXISTS idx_app_store_collection_ord
    ON app_store (collection, ord);

-- Tracks which collections have had their seed applied, so clearing all rows
-- from a collection does not silently reseed it.
CREATE TABLE IF NOT EXISTS app_store_meta (
    collection text        PRIMARY KEY,
    seeded_at  timestamptz NOT NULL DEFAULT now()
);
