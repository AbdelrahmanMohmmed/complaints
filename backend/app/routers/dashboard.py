from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
from .. import models, database, oauth2
from ..schemas import dashboard
from collections import defaultdict

router = APIRouter(prefix="/dashboard", tags=['Dashboard'])

@router.get("/stats", response_model=dashboard.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user)
):
    current_user = db.query(models.User).filter(models.User.user_id == current_user_id).first()
    company_id = current_user.company_id

    feedback = db.query(models.Feedback).filter(
        models.Feedback.company_id == company_id
    ).all()

    total = len(feedback)
    open_count = sum(1 for f in feedback if f.status == 'open')
    in_progress = sum(1 for f in feedback if f.status == 'inProgress')
    resolved = sum(1 for f in feedback if f.status == 'resolved')
    closed = sum(1 for f in feedback if f.status == 'closed')
    high_priority = sum(1 for f in feedback if f.priority == 'high')
    positive = sum(1 for f in feedback if f.sentiment == 'positive')
    negative = sum(1 for f in feedback if f.sentiment == 'negative')
    neutral = sum(1 for f in feedback if f.sentiment == 'neutral')

    # Monthly data — last 6 months
    monthly_data = []
    for i in range(5, -1, -1):
        month_start = datetime.now().replace(day=1) - timedelta(days=i * 30)
        month_end = month_start.replace(day=28) + timedelta(days=4)
        month_end = month_end.replace(day=1)
        month_feedback = [
            f for f in feedback
            if f.created_at and month_start <= f.created_at.replace(tzinfo=None) < month_end
        ]
        monthly_data.append({
            "month": month_start.strftime("%b"),
            "complaints": len(month_feedback),
            "resolved": sum(1 for f in month_feedback if f.status in ('resolved', 'closed')),
        })

    # Category breakdown
    category_counts: dict = {}
    for f in feedback:
        if f.category_id:
            cat = db.query(models.FeedbackCategory).filter(
                models.FeedbackCategory.category_id == f.category_id
            ).first()
            name = cat.category_name if cat else 'Unknown'
            category_counts[name] = category_counts.get(name, 0) + 1

    category_data = [{"name": k, "value": v} for k, v in category_counts.items()]

    return {
        "total_feedback": total,
        "open_count": open_count,
        "in_progress_count": in_progress,
        "resolved_count": resolved,
        "closed_count": closed,
        "high_priority_count": high_priority,
        "positive_count": positive,
        "negative_count": negative,
        "neutral_count": neutral,
        "monthly_data": monthly_data,
        "category_data": category_data,
    }


@router.get("/reports")
def get_reports(
    date_range: str = "30days",
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user)
):
    current_user = db.query(models.User).filter(models.User.user_id == current_user_id).first()
    company_id = current_user.company_id

    # Date filter
    now = datetime.now()
    range_map = {
        "today":  now - timedelta(days=1),
        "7days":  now - timedelta(days=7),
        "30days": now - timedelta(days=30),
        "90days": now - timedelta(days=90),
        "year":   now - timedelta(days=365),
    }
    since = range_map.get(date_range, now - timedelta(days=30))

    all_feedback = db.query(models.Feedback).filter(
        models.Feedback.company_id == company_id
    ).all()

    filtered = [
        f for f in all_feedback
        if f.created_at and f.created_at.replace(tzinfo=None) >= since
    ]
    prev_filtered = [
        f for f in all_feedback
        if f.created_at and f.created_at.replace(tzinfo=None) < since
        and f.created_at.replace(tzinfo=None) >= since - (now - since)
    ]

    total = len(filtered)
    prev_total = len(prev_filtered)

    resolved = [f for f in filtered if f.status in ('resolved', 'closed')]
    prev_resolved = [f for f in prev_filtered if f.status in ('resolved', 'closed')]

    resolution_rate = round((len(resolved) / total * 100), 1) if total else 0
    prev_resolution_rate = round((len(prev_resolved) / prev_total * 100), 1) if prev_total else 0

    # Sentiment counts
    positive = sum(1 for f in filtered if f.sentiment == 'positive')
    negative = sum(1 for f in filtered if f.sentiment == 'negative')
    neutral  = sum(1 for f in filtered if f.sentiment == 'neutral')
    prev_positive = sum(1 for f in prev_filtered if f.sentiment == 'positive')

    sentiment_pct = round((positive / total * 100), 1) if total else 0
    prev_sentiment_pct = round((prev_positive / prev_total * 100), 1) if prev_total else 0

    def pct_change(current, previous):
        if previous == 0:
            return "+0%"
        change = ((current - previous) / previous) * 100
        sign = "+" if change >= 0 else ""
        return f"{sign}{round(change, 1)}%"

    # Monthly sentiment trend — last 6 months
    sentiment_trend = []
    for i in range(5, -1, -1):
        m_start = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        m_end = (m_start + timedelta(days=32)).replace(day=1)
        month_fb = [
            f for f in all_feedback
            if f.created_at and m_start <= f.created_at.replace(tzinfo=None) < m_end
        ]
        sentiment_trend.append({
            "month": m_start.strftime("%b"),
            "positive": sum(1 for f in month_fb if f.sentiment == 'positive'),
            "negative": sum(1 for f in month_fb if f.sentiment == 'negative'),
            "neutral":  sum(1 for f in month_fb if f.sentiment == 'neutral'),
        })

    # Category breakdown with sentiment
    cat_map = defaultdict(lambda: {"name": "", "total": 0, "positive": 0, "negative": 0, "neutral": 0})
    for f in filtered:
        if f.category_id:
            cat = db.query(models.FeedbackCategory).filter(
                models.FeedbackCategory.category_id == f.category_id
            ).first()
            name = cat.category_name if cat else "Unknown"
            cat_map[name]["name"] = name
            cat_map[name]["total"] += 1
            if f.sentiment == 'positive': cat_map[name]["positive"] += 1
            elif f.sentiment == 'negative': cat_map[name]["negative"] += 1
            else: cat_map[name]["neutral"] += 1
    category_data = list(cat_map.values())

    # Channel data from apis table
    apis = db.query(models.Api).filter(models.Api.company_id == company_id).all()
    channel_colors = {
        "facebook": "#3b82f6",
        "whatsapp": "#22c55e",
        "twitter":  "#6b7280",
        "email":    "#f59e0b",
    }
    channel_data = [
        {
            "name": api.channel_name.capitalize(),
            "value": sum(1 for f in filtered if f.api_id == api.api_id),
            "color": channel_colors.get(api.channel_name.lower(), "#8b5cf6"),
        }
        for api in apis
    ]
    # Add null api_id as "Direct"
    direct_count = sum(1 for f in filtered if f.api_id is None)
    if direct_count:
        channel_data.append({"name": "Direct", "value": direct_count, "color": "#8b5cf6"})

    # Agent performance
    agents = db.query(models.User).filter(
        models.User.company_id == company_id,
        models.User.role_id == 3
    ).all()
    agent_data = []
    for agent in agents:
        agent_data.append({
            "name": f"{agent.f_name} {agent.l_name}",
            "assigned": sum(1 for f in filtered),  # placeholder — no assignment table yet
            "resolved": len(resolved),
            "avgTime": 0,
            "satisfaction": round(sentiment_pct),
        })

    # Weekly resolution trend — last 6 weeks
    resolution_trend = []
    for i in range(5, -1, -1):
        w_start = now - timedelta(weeks=i+1)
        w_end   = now - timedelta(weeks=i)
        week_fb = [
            f for f in all_feedback
            if f.created_at and w_start <= f.created_at.replace(tzinfo=None) < w_end
        ]
        resolution_trend.append({
            "week": f"W{6-i}",
            "resolved": sum(1 for f in week_fb if f.status in ('resolved', 'closed')),
            "avgTime": 0,
        })

    return {
        "summary": {
            "total_feedback": total,
            "total_change": pct_change(total, prev_total),
            "resolution_rate": resolution_rate,
            "resolution_rate_change": pct_change(resolution_rate, prev_resolution_rate),
            "sentiment_pct": sentiment_pct,
            "sentiment_change": pct_change(sentiment_pct, prev_sentiment_pct),
            "positive_count": positive,
            "negative_count": negative,
            "neutral_count": neutral,
        },
        "sentiment_trend": sentiment_trend,
        "category_data": category_data,
        "channel_data": channel_data,
        "agent_data": agent_data,
        "resolution_trend": resolution_trend,
    }