# syntax=docker/dockerfile:1

# ============================================================================
# Backend image — FastAPI (app.main:app), Python 3.10 slim, multi-stage.
#
#   builder : installs Python dependencies into /opt/venv (build tools live
#             ONLY here, so the runtime images stay lean)
#   dev     : DEFAULT target — bind-mounted source + uvicorn --reload
#   prod    : non-root, no reload, uvicorn workers
#
# NOTE: the build context is the REPOSITORY ROOT (not backend/), because
# requirements.txt lives at the repo root. docker-compose sets this up.
# ============================================================================

ARG PYTHON_VERSION=3.10

# ---------------------------------------------------------------------------
# builder — resolve + install dependencies into an isolated virtualenv
# ---------------------------------------------------------------------------
FROM python:${PYTHON_VERSION}-slim AS builder

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1

# Build-only system packages:
#   build-essential -> gcc/make, needed when a dependency has no prebuilt
#                      manylinux wheel for CPython 3.10 (psycopg2 compiles from
#                      source; some scientific packages may fall back to source)
#   libpq-dev       -> PostgreSQL client headers required to compile psycopg2
RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# Dependencies live in a venv so the runtime images only ship /opt/venv.
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Manifest first. This layer is cached and only invalidated when
# requirements.txt changes, so application-code edits never reinstall deps.
COPY requirements.txt ./

# BuildKit cache mount keeps the pip download/wheel cache between builds
# (the cache is NOT written into the image layer).
RUN --mount=type=cache,target=/root/.cache/pip,id=complaints-pip \
    pip install --upgrade pip \
 && pip install -r requirements.txt

# ---------------------------------------------------------------------------
# runtime-base — shared foundation for dev and prod
# ---------------------------------------------------------------------------
FROM python:${PYTHON_VERSION}-slim AS runtime-base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/opt/venv/bin:$PATH" \
    PORT=8000

# Runtime-only system packages:
#   libpq5   -> shared library used by the psycopg2 C extension
#   libgomp1 -> OpenMP runtime required by xgboost (and used by scikit-learn)
#   (curl/wget are intentionally NOT installed; healthchecks use Python's stdlib)
RUN apt-get update \
 && apt-get install -y --no-install-recommends libpq5 libgomp1 \
 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv
# Install Chromium and its required system libraries for Playwright
RUN /opt/venv/bin/python -m playwright install --with-deps chromium
WORKDIR /app
# backend/ contents land at /app, so `app.main:app` resolves and alembic.ini /
# alembic/ stay next to the code for `alembic upgrade head`.
COPY backend/ ./

# ---------------------------------------------------------------------------
# dev (default) — hot reload. Source is bind-mounted over /app by compose;
# dependencies live in /opt/venv, so the mount never hides them.
# ---------------------------------------------------------------------------
FROM runtime-base AS dev

EXPOSE 8000

# watchfiles (already a dependency of uvicorn[standard]-style installs) powers
# --reload. Set WATCHFILES_FORCE_POLLING=1 if inotify events do not propagate
# through your bind mount (common on Docker Desktop / network drives).
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", \
     "--reload", "--reload-dir", "/app"]

# ---------------------------------------------------------------------------
# prod — no dev server, no reload, non-root user
# ---------------------------------------------------------------------------
FROM runtime-base AS prod

RUN groupadd --gid 1000 appuser \
 && useradd --uid 1000 --gid 1000 --create-home appuser \
 && chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD python -c "import sys,urllib.request; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=4).status == 200 else 1)"

# Keep workers=1 while the in-process APScheduler jobs are enabled — every
# worker would otherwise start its own scheduler and duplicate job runs.
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers ${UVICORN_WORKERS:-1}"]
