# Feedback Management System

<a target="_blank" href="https://cookiecutter-data-science.drivendata.org/">
    <img src="https://img.shields.io/badge/CCDS-Project%20template-328F97?logo=cookiecutter" />
</a>

A short description of the project.

## Project Organization

```
├── LICENSE            <- Open-source license if one is chosen
├── Makefile           <- Makefile with convenience commands like `make data` or `make train`
├── README.md          <- The top-level README for developers using this project.
├── data
│   ├── external       <- Data from third party sources.
│   ├── interim        <- Intermediate data that has been transformed.
│   ├── processed      <- The final, canonical data sets for modeling.
│   └── raw            <- The original, immutable data dump.
│
├── docs               <- A default mkdocs project; see www.mkdocs.org for details
│
├── models             <- Trained and serialized models, model predictions, or model summaries
│
├── notebooks          <- Jupyter notebooks. Naming convention is a number (for ordering),
│                         the creator's initials, and a short `-` delimited description, e.g.
│                         `1.0-jqp-initial-data-exploration`.
│
├── pyproject.toml     <- Project configuration file with package metadata for 
│                         complaints and configuration for tools like black
│
├── references         <- Data dictionaries, manuals, and all other explanatory materials.
│
├── reports            <- Generated analysis as HTML, PDF, LaTeX, etc.
│   └── figures        <- Generated graphics and figures to be used in reporting
│
├── requirements.txt   <- The requirements file for reproducing the analysis environment, e.g.
│                         generated with `pip freeze > requirements.txt`
│
├── setup.cfg          <- Configuration file for flake8
│
└── complaints   <- Source code for use in this project.
    │
    ├── __init__.py             <- Makes complaints a Python module
    │
    ├── config.py               <- Store useful variables and configuration
    │
    ├── dataset.py              <- Scripts to download or generate data
    │
    ├── features.py             <- Code to create features for modeling
    │
    ├── modeling                
    │   ├── __init__.py 
    │   ├── predict.py          <- Code to run model inference with trained models          
    │   └── train.py            <- Code to train models
    │
    └── plots.py                <- Code to create visualizations
```

---

## Role Matrix

| Role                    | Dashboard | Feedback | Reports | Users | Companies | Integration | Settings |
|-------------------------|-----------|----------|---------|-------|-----------|-------------|----------|
| **Manager**             | ✅ | ✅ | ✅ | ✅ | ✅ | ✅           | ✅ |
| **CSS**                 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌           | ✅ |
| **WebSiteConfigurator** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅           | ✅ |


---

## Environment Setup

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```
#### Docker (Linux/macOS)
Build the image from the `frontend` directory, then run it:
```bash
cd ~/complaints/frontend
sudo docker build \
  --progress=plain \
  --target dev \
  -t complaints-frontend:dev .

sudo docker run --rm --name complaints-frontend -p 5173:5173 complaints-frontend:dev
```

#### Docker (Windows PowerShell)
Build the image from the `frontend` directory, then run it:
```powershell
Set-Location "$HOME\complaints\frontend"
docker build `
  --progress=plain `
  --target dev `
  -t complaints-frontend:dev .

docker run --rm --name complaints-frontend -p 5173:5173 complaints-frontend:dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
# Create .env file with database URL and secrets
uvicorn app.main:app --reload
```
#### Docker (Linux/macOS)
Build the image from the repository root, then run it:
```bash
cd ~/complaints
sudo docker build \
  --progress=plain \
  --target dev \
  -t complaints-backend:dev \
  -f backend/Dockerfile .

sudo docker run --rm --name complaints-backend \
  --add-host=host.docker.internal:host-gateway \
  --env-file backend/.env \
  -p 8000:8000 \
  complaints-backend:dev
```

#### Docker (Windows PowerShell)
Build the image from the repository root, then run it:
```powershell
Set-Location "$HOME\complaints"
docker build `
  --progress=plain `
  --target dev `
  -t complaints-backend:dev `
  -f backend/Dockerfile .

docker run --rm --name complaints-backend `
  --add-host=host.docker.internal:host-gateway `
  --env-file backend/.env `
  -p 8000:8000 `
  complaints-backend:dev
```

#### Docker database (Linux/macOS)
```bash
sudo docker run -d --name complaints-db --restart unless-stopped \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=change_this_password \
  -e POSTGRES_DB=complaints \
  -p 5432:5432 \
  -v complaints-postgres-data:/var/lib/postgresql/data \
  postgres:16-alpine
```

#### Docker database (Windows PowerShell)
```powershell
docker run -d --name complaints-db --restart unless-stopped `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=change_this_password `
  -e POSTGRES_DB=complaints `
  -p 5432:5432 `
  -v complaints-postgres-data:/var/lib/postgresql/data `
  postgres:16-alpine
```
---

## Testing

### Frontend
- Manual: `npm run dev` + browser testing
- E2E: Cypress/Playwright (optional)

### Backend
- Manual: POST requests via [tests/http_request.http](backend/tests/http_request.http)
- Unit: pytest (optional)

---

## Deployment Notes

**Frontend:**
- Build: `npm run build` → outputs to `dist/`
- Host on: Netlify, Vercel, Cloudflare Pages, or static hosting
- https://ara2kom.vercel.app
- http://arakom.duckdns.org
- https://ara2komai.me/

**Backend:**
- ASGI server: Gunicorn + Uvicorn workers
- Database: PostgreSQL (production)

---
--------
