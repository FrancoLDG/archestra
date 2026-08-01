-- drizzle-migration-linter: allow-breaking
-- drizzle-migration-linter: reason=The impersonated_by column is added in this same migration and is NULL for every existing row, so the FK validation matches nothing and cannot fail on existing data. audit_logs is append-only from the app; the brief ACCESS EXCLUSIVE lock only blocks inserts for the instant of the catalog change.
ALTER TABLE "audit_logs" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_impersonated_by_user_id_fk" FOREIGN KEY ("impersonated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- Backfill the system-level user.role for members whose org role grants
-- member:impersonate. better-auth's admin plugin gates impersonation on this
-- column, which historically only the seeded bootstrap admin received, so
-- members promoted to org admin (or to a custom role granting impersonation)
-- were rejected. Upgrade-only: existing 'admin' values are never stripped
-- here; ongoing sync happens in application code on every role change.
-- (permission LIKE check instead of jsonb operators for PGlite compatibility;
-- "impersonate" appears in no other permission value.)
UPDATE "user" u SET "role" = 'admin'
WHERE (u."role" IS NULL OR u."role" <> 'admin')
  AND EXISTS (
    SELECT 1
    FROM "member" m
    LEFT JOIN "organization_role" r
      ON r."organization_id" = m."organization_id" AND r."role" = m."role"
    WHERE m."user_id" = u."id"
      AND (m."role" = 'admin' OR r."permission" LIKE '%"impersonate"%')
  );
