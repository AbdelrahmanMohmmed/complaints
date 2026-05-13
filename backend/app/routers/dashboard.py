from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
from .. import models, database, oauth2
from ..ai.labels import (
    EMOTION_LABEL2ID,
    PROBLEM_TYPE_DEFAULT_LABEL,
    PROBLEM_TYPE_ID2LABEL,
    PROBLEM_TYPE_LABEL2ID,
)
from ..schemas import dashboard
from collections import defaultdict

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _resolve_problem_type_id(feedback: models.Feedback) -> int | None:
    if feedback.problem_type_id is not None:
        return feedback.problem_type_id
    if feedback.problem_type:
        return PROBLEM_TYPE_LABEL2ID.get(feedback.problem_type)
    return None


def _resolve_emotion_id(feedback: models.Feedback) -> int | None:
    if feedback.emotion_id is not None:
        return feedback.emotion_id
    if feedback.emotion:
        return EMOTION_LABEL2ID.get(feedback.emotion)
    return None


@router.get("/stats", response_model=dashboard.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user),
):
    current_user = (
        db.query(models.User).filter(models.User.user_id == current_user_id).first()
    )
    company_id = current_user.company_id

    feedback = (
        db.query(models.Feedback).filter(models.Feedback.company_id == company_id).all()
    )

    total = len(feedback)
    open_count = sum(1 for f in feedback if f.status == "open")
    in_progress = sum(1 for f in feedback if f.status == "inProgress")
    resolved = sum(1 for f in feedback if f.status == "resolved")
    closed = sum(1 for f in feedback if f.status == "closed")
    high_priority = sum(1 for f in feedback if f.priority == "high")
    positive = sum(1 for f in feedback if f.sentiment == "positive")
    negative = sum(1 for f in feedback if f.sentiment == "negative")
    neutral = sum(1 for f in feedback if f.sentiment == "neutral")
    frustrated = sum(1 for f in feedback if _resolve_emotion_id(f) == 0)
    neutral_emotion = sum(1 for f in feedback if _resolve_emotion_id(f) == 1)
    disgusted = sum(1 for f in feedback if _resolve_emotion_id(f) == 2)
    satisfied = sum(1 for f in feedback if _resolve_emotion_id(f) == 3)

    # Monthly data — last 6 months
    monthly_data = []
    for i in range(5, -1, -1):
        month_start = datetime.now().replace(day=1) - timedelta(days=i * 30)
        month_end = month_start.replace(day=28) + timedelta(days=4)
        month_end = month_end.replace(day=1)
        month_feedback = [
            f
            for f in feedback
            if f.created_at
            and month_start <= f.created_at.replace(tzinfo=None) < month_end
        ]
        monthly_data.append(
            {
                "month": month_start.strftime("%b"),
                "complaints": len(month_feedback),
                "resolved": sum(
                    1 for f in month_feedback if f.status in ("resolved", "closed")
                ),
            }
        )

    # Category breakdown (problem type)
    category_counts: dict[int, int] = {}
    for f in feedback:
        problem_type_id = _resolve_problem_type_id(f)
        if problem_type_id is None:
            continue
        category_counts[problem_type_id] = category_counts.get(problem_type_id, 0) + 1

    category_data = [
        {
            "problem_type_id": problem_type_id,
            "name": PROBLEM_TYPE_ID2LABEL.get(
                problem_type_id, PROBLEM_TYPE_DEFAULT_LABEL
            ),
            "value": count,
        }
        for problem_type_id, count in category_counts.items()
    ]

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
        "frustrated_count": frustrated,
        "neutral_emotion_count": neutral_emotion,
        "disgusted_count": disgusted,
        "satisfied_count": satisfied,
        "monthly_data": monthly_data,
        "category_data": category_data,
    }


@router.get("/reports")
def get_reports(
    date_range: str = "30days",
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user),
):
    current_user = (
        db.query(models.User).filter(models.User.user_id == current_user_id).first()
    )
    company_id = current_user.company_id

    # Date filter
    now = datetime.now()
    range_map = {
        "today": now - timedelta(days=1),
        "7days": now - timedelta(days=7),
        "30days": now - timedelta(days=30),
        "90days": now - timedelta(days=90),
        "year": now - timedelta(days=365),
    }
    since = range_map.get(date_range, now - timedelta(days=30))

    all_feedback = (
        db.query(models.Feedback).filter(models.Feedback.company_id == company_id).all()
    )

    filtered = [
        f
        for f in all_feedback
        if f.created_at and f.created_at.replace(tzinfo=None) >= since
    ]
    prev_filtered = [
        f
        for f in all_feedback
        if f.created_at
        and f.created_at.replace(tzinfo=None) < since
        and f.created_at.replace(tzinfo=None) >= since - (now - since)
    ]

    total = len(filtered)
    prev_total = len(prev_filtered)

    resolved = [f for f in filtered if f.status in ("resolved", "closed")]
    prev_resolved = [f for f in prev_filtered if f.status in ("resolved", "closed")]

    resolution_rate = round((len(resolved) / total * 100), 1) if total else 0
    prev_resolution_rate = (
        round((len(prev_resolved) / prev_total * 100), 1) if prev_total else 0
    )

    # Sentiment counts
    positive = sum(1 for f in filtered if f.sentiment == "positive")
    negative = sum(1 for f in filtered if f.sentiment == "negative")
    neutral = sum(1 for f in filtered if f.sentiment == "neutral")
    prev_positive = sum(1 for f in prev_filtered if f.sentiment == "positive")

    sentiment_pct = round((positive / total * 100), 1) if total else 0
    prev_sentiment_pct = (
        round((prev_positive / prev_total * 100), 1) if prev_total else 0
    )

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
            f
            for f in all_feedback
            if f.created_at and m_start <= f.created_at.replace(tzinfo=None) < m_end
        ]
        sentiment_trend.append(
            {
                "month": m_start.strftime("%b"),
                "positive": sum(1 for f in month_fb if f.sentiment == "positive"),
                "negative": sum(1 for f in month_fb if f.sentiment == "negative"),
                "neutral": sum(1 for f in month_fb if f.sentiment == "neutral"),
            }
        )

    # Category breakdown with sentiment (problem type)
    cat_map = defaultdict(
        lambda: {
            "problem_type_id": None,
            "name": "",
            "total": 0,
            "positive": 0,
            "negative": 0,
            "neutral": 0,
        }
    )
    for f in filtered:
        problem_type_id = _resolve_problem_type_id(f)
        if problem_type_id is None:
            continue
        name = PROBLEM_TYPE_ID2LABEL.get(problem_type_id, PROBLEM_TYPE_DEFAULT_LABEL)
        cat_map[problem_type_id]["problem_type_id"] = problem_type_id
        cat_map[problem_type_id]["name"] = name
        cat_map[problem_type_id]["total"] += 1
        if f.sentiment == "positive":
            cat_map[problem_type_id]["positive"] += 1
        elif f.sentiment == "negative":
            cat_map[problem_type_id]["negative"] += 1
        else:
            cat_map[problem_type_id]["neutral"] += 1
    category_data = list(cat_map.values())

    # Channel data from apis table
    apis = db.query(models.Api).filter(models.Api.company_id == company_id).all()
    channel_colors = {
        "facebook": "#1d4ed8",
        "whatsapp": "#16a34a",
        "twitter": "#0ea5e9",
        "email": "#f97316",
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
        channel_data.append(
            {"name": "Direct", "value": direct_count, "color": "#7c3aed"}
        )

    # Emotion data
    emotion_map = defaultdict(
        lambda: {
            "emotion_id": None,
            "total": 0,
            "positive": 0,
            "negative": 0,
            "neutral": 0,
        }
    )
    for f in filtered:
        emotion_id = _resolve_emotion_id(f)
        if emotion_id is None:
            continue
        emotion_map[emotion_id]["emotion_id"] = emotion_id
        emotion_map[emotion_id]["total"] += 1
        if f.sentiment == "positive":
            emotion_map[emotion_id]["positive"] += 1
        elif f.sentiment == "negative":
            emotion_map[emotion_id]["negative"] += 1
        else:
            emotion_map[emotion_id]["neutral"] += 1
    emotion_data = list(emotion_map.values())

    # Priority distribution
    priority_levels = ["low", "medium", "high", "critical"]
    priority_counts = {level: 0 for level in priority_levels}
    for f in filtered:
        level = (f.priority or "").lower().strip()
        if level in priority_counts:
            priority_counts[level] += 1
    priority_data = [
        {"name": level, "value": priority_counts[level]} for level in priority_levels
    ]

    # Priority by category
    priority_by_category_map = defaultdict(
        lambda: {
            "problem_type_id": None,
            "name": "",
            "low": 0,
            "medium": 0,
            "high": 0,
            "critical": 0,
        }
    )
    for f in filtered:
        problem_type_id = _resolve_problem_type_id(f)
        if problem_type_id is None:
            continue
        name = PROBLEM_TYPE_ID2LABEL.get(problem_type_id, PROBLEM_TYPE_DEFAULT_LABEL)
        entry = priority_by_category_map[problem_type_id]
        entry["problem_type_id"] = problem_type_id
        entry["name"] = name
        level = (f.priority or "").lower().strip()
        if level in priority_levels:
            entry[level] += 1
    priority_by_category = list(priority_by_category_map.values())

    # Priority trend — last 6 months
    priority_trend = []
    for i in range(5, -1, -1):
        m_start = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        m_end = (m_start + timedelta(days=32)).replace(day=1)
        month_fb = [
            f
            for f in all_feedback
            if f.created_at and m_start <= f.created_at.replace(tzinfo=None) < m_end
        ]
        month_counts = {level: 0 for level in priority_levels}
        for f in month_fb:
            level = (f.priority or "").lower().strip()
            if level in month_counts:
                month_counts[level] += 1
        priority_trend.append(
            {
                "month": m_start.strftime("%b"),
                "low": month_counts["low"],
                "medium": month_counts["medium"],
                "high": month_counts["high"],
                "critical": month_counts["critical"],
            }
        )

    # Agent performance
    agents = (
        db.query(models.User)
        .filter(models.User.company_id == company_id, models.User.role_id == 3)
        .all()
    )
    agent_data = []
    for agent in agents:
        agent_data.append(
            {
                "name": f"{agent.f_name} {agent.l_name}",
                "assigned": sum(
                    1 for f in filtered
                ),  # placeholder — no assignment table yet
                "resolved": len(resolved),
                "avgTime": 0,
                "satisfaction": round(sentiment_pct),
            }
        )

    # Weekly resolution trend — last 6 weeks
    resolution_trend = []
    for i in range(5, -1, -1):
        w_start = now - timedelta(weeks=i + 1)
        w_end = now - timedelta(weeks=i)
        week_fb = [
            f
            for f in all_feedback
            if f.created_at and w_start <= f.created_at.replace(tzinfo=None) < w_end
        ]
        resolution_trend.append(
            {
                "week": f"W{6-i}",
                "resolved": sum(
                    1 for f in week_fb if f.status in ("resolved", "closed")
                ),
                "avgTime": 0,
            }
        )

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
        "emotion_data": emotion_data,
        "channel_data": channel_data,
        "priority_data": priority_data,
        "priority_by_category": priority_by_category,
        "priority_trend": priority_trend,
        "agent_data": agent_data,
        "resolution_trend": resolution_trend,
    }
