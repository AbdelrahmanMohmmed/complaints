# syntax=docker/dockerfile:1

# ============================================================================
# Frontend image — React + Vite 6, multi-stage.
#
#   deps  : npm ci (cached) — shared by dev and build
#   dev   : DEFAULT target — Vite dev server on 0.0.0.0 for HMR
#   build : production static bundle (dist/)
#   prod  : nginx:alpine serving dist/, with SPA fallback
#
# NOTE: the build context is ./frontend, because package.json and
# package-lock.json live there. docker-compose sets this up.
# ============================================================================

ARG NODE_VERSION=20

# ---------------------------------------------------------------------------
# deps — install exact dependencies from the lockfile
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS deps

WORKDIR /app

# Manifests first: cached layer, invalidated only when the lockfile changes.
COPY package.json package-lock.json ./

# BuildKit cache mount keeps npm's cache between builds. `npm ci` installs the
# exact locked tree (including the musl rollup/esbuild binaries for Alpine).
RUN --mount=type=cache,target=/root/.npm,id=complaints-npm \
    npm ci --no-audit --no-fund --verbose

# ---------------------------------------------------------------------------
# dev (default) — Vite dev server with HMR
# ---------------------------------------------------------------------------
FROM deps AS dev

WORKDIR /app

COPY . .

EXPOSE 5173

# --host binds to 0.0.0.0 so the dev server is reachable from the host.
# Compose bind-mounts ./frontend over /app and shields /app/node_modules with a
# named volume, so this installed tree is not hidden by the mount.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# ---------------------------------------------------------------------------
# build — produce the static production bundle
# ---------------------------------------------------------------------------
FROM deps AS build

WORKDIR /app

COPY . .

# Vite automatically loads frontend/.env.production at build time
# (VITE_API_BASE_URL is baked into the bundle — it is a browser-facing URL).
RUN npm run build

# ---------------------------------------------------------------------------
# prod — static files served by nginx; no Node/dev tooling in the final image
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS prod

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
