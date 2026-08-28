import os

from typing import Optional

from beanie import PydanticObjectId

from fastapi import (
    Depends,
    Request
)

from fastapi_users import (
    BaseUserManager
)

from fastapi_users.db import (
    BeanieUserDatabase,
    ObjectIDIDMixin
)

from dotenv import load_dotenv

from auth.db import (
    User,
    get_user_db
)


load_dotenv()


SECRET = os.getenv(
    "AUTH_SECRET"
)


class UserManager(
    ObjectIDIDMixin,
    BaseUserManager[
        User,
        PydanticObjectId
    ]
):

    reset_password_token_secret = SECRET

    verification_token_secret = SECRET


    async def on_after_register(
        self,
        user: User,
        request: Optional[Request] = None
    ):
        print(
            f"User registered: {user.email}"
        )


async def get_user_manager(
    user_db: BeanieUserDatabase = Depends(
        get_user_db
    )
):
    yield UserManager(
        user_db
    )