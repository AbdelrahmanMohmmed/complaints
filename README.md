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

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
# Create .env file with database URL and secrets
uvicorn app.main:app --reload
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
- Deploy: Docker container or direct server
- ASGI server: Gunicorn + Uvicorn workers
- Database: PostgreSQL (production)

---
--------

