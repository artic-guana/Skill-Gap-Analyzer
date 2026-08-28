# auth/auth_config.py

import os

from dotenv import load_dotenv
from beanie import PydanticObjectId

from fastapi_users import FastAPIUsers
from fastapi_users.authentication import (
    AuthenticationBackend,
    CookieTransport,
    JWTStrategy
)

from auth.db import User
from auth.manager import get_user_manager


load_dotenv()

SECRET = os.getenv("AUTH_SECRET")


cookie_transport = CookieTransport(
    cookie_name="auth_token",
    cookie_max_age=60 * 60 * 24 * 7,
    cookie_httponly=True,
    cookie_secure=False,
    cookie_samesite="lax"
)


def get_jwt_strategy():
    return JWTStrategy(
        secret=SECRET,
        lifetime_seconds=60 * 60 * 24 * 7
    )


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy
)


fastapi_users = FastAPIUsers[
    User,
    PydanticObjectId
](
    get_user_manager,
    [auth_backend]
)


current_active_user = fastapi_users.current_user(
    active=True
)