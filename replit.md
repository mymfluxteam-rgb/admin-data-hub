# Workspace

## Overview

pnpm workspace monorepo using JavaScript (ES6+). Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **Language**: JavaScript ES2020+ with lightweight TypeScript project configs for workspace tooling compatibility
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle) for API, Vite for dashboard

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── admin-dashboard/    # React + Vite admin dashboard frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Workspace Tooling

The root `tsconfig.json` lists shared library packages as project references so Vite and editor tooling can resolve the monorepo cleanly. Library packages use lightweight `tsconfig.json` files with `allowJs` enabled because the application source is JavaScript.

- **Project references** — shared library packages have package-level config files to satisfy workspace tooling.
- **Runtime validation** — workflow restarts and logs are the source of truth for Replit runtime health.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.js` — reads `PORT`, starts Express
- App setup: `src/app.js` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.js` mounts sub-routers; `src/routes/health.js` exposes `GET /healthz` (full path: `/api/healthz`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.mjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

## API Routes

All routes mounted at `/api/`:

| Route | File | Description |
|---|---|---|
| `/users` | `routes/users.js` | User CRUD, ban/unban, credits, expiry, API keys, admin-only plan upgrades |
| `/me/provision` | `routes/me.js` | Creates or repairs OAuth user profiles with the default Tester plan |
| `/me/plan` | `routes/me.js` | Current user's plan and usage summary |
| `/plans` | `routes/plans.js` | Lists available plans |
| `/transactions` | `routes/transactions.js` | Transaction history |
| `/hwids` | `routes/hwids.js` | HWID/device management |
| `/sessions` | `routes/sessions.js` | Active session management |
| `/audit-logs` | `routes/auditLogs.js` | Audit log history |
| `/metrics` | `routes/metrics.js` | Dashboard metrics |
| `/chart-data` | `routes/chartData.js` | Chart time-series data |
| `/api-keys` | `routes/apiKeys.js` | Third-party API key management (CRUD, validate, rotate, revoke) |
| `/api-key-templates` | `routes/apiKeyTemplates.js` | Reusable API key permission templates |
| `/settings` | `routes/settings.js` | System settings (per-group upsert/fetch) |
| `/admin-users` | `routes/adminUsers.js` | Admin user promotion/demotion/role management |

## Plan Assignment

- New Google/GitHub OAuth profiles are assigned the `Tester` plan by default through `/api/me/provision` and the Supabase migration trigger in `artifacts/api-server/migrations/003_user_plans.sql`.
- `users.plan_id` references `plans.id`; apply `003_user_plans.sql` in Supabase SQL Editor to add the relationship and backfill existing users.
- Manual plan changes are handled by `PUT /api/users/:id/plan`, require an admin role, and only allow upgrades to `Developer` or `Seller`.

## Required Supabase Tables

In addition to the existing tables (`users`, `transactions`, `hwids`, `device_sessions`, `audit_logs`), the following tables must be created in Supabase SQL Editor:

```sql
-- API Keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  api_key TEXT UNIQUE NOT NULL,
  api_key_hash TEXT UNIQUE NOT NULL,
  key_name TEXT NOT NULL,
  key_type TEXT DEFAULT 'third_party',
  permissions JSONB DEFAULT '[]'::jsonb,
  allowed_ips TEXT[] DEFAULT '{}',
  allowed_origins TEXT[] DEFAULT '{}',
  rate_limit INTEGER DEFAULT 100,
  usage_count BIGINT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES users(id),
  revoke_reason TEXT
);

CREATE TABLE api_key_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  response_status INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE api_key_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT UNIQUE NOT NULL,
  permissions JSONB NOT NULL,
  rate_limit INTEGER,
  expires_in_days INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  setting_group TEXT NOT NULL,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Admin Dashboard Pages

- `/` — Dashboard with metrics and charts
- `/users` — User management
- `/credits` — Credit management
- `/transactions` — Transaction history
- `/hwids` — HWID/device management
- `/sessions` — Active sessions
- `/analytics` — Analytics
- `/audit-logs` — Audit logs
- `/settings` — Full 10-tab settings page:
  - General, User Management, API, HWID/Device, Credits & Pricing, Security, Notifications, System Status, Backup & Restore, Admin Users
