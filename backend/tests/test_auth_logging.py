from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.routers import auth


@pytest.mark.asyncio
async def test_successful_login_logs_email_but_not_password(caplog, monkeypatch):
    email = "learner@example.com"
    password = "do-not-log-this"
    user = SimpleNamespace(email=email, hashed_pw="hashed")

    async def get_user_by_email(_db, _email):
        return user

    monkeypatch.setattr(auth, "get_user_by_email", get_user_by_email)
    monkeypatch.setattr(auth, "verify_password", lambda _password, _hashed: True)
    monkeypatch.setattr(auth, "create_access_token", lambda *_args, **_kwargs: "token")
    caplog.set_level("INFO", logger=auth.__name__)

    result = await auth.token(
        OAuth2PasswordRequestForm(username=email, password=password),
        db=object(),
    )

    assert result == {"access_token": "token", "token_type": "bearer"}
    assert '"outcome":"success"' in caplog.text
    assert email in caplog.text
    assert password not in caplog.text


@pytest.mark.asyncio
async def test_failed_login_logs_email_but_not_password(caplog, monkeypatch):
    email = "learner@example.com"
    password = "do-not-log-this"

    async def get_user_by_email(_db, _email):
        return None

    monkeypatch.setattr(auth, "get_user_by_email", get_user_by_email)
    caplog.set_level("INFO", logger=auth.__name__)

    with pytest.raises(HTTPException) as exc_info:
        await auth.token(
            OAuth2PasswordRequestForm(username=email, password=password),
            db=object(),
        )

    assert exc_info.value.status_code == 401
    assert '"outcome":"failure"' in caplog.text
    assert email in caplog.text
    assert password not in caplog.text
