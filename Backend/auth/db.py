# auth/db.py

import os

from dotenv import load_dotenv

from pymongo import AsyncMongoClient

from beanie import Document

from fastapi_users.db import (
    BeanieBaseUser,
    BeanieUserDatabase
)


load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")


client = AsyncMongoClient(
    MONGO_URI
)

db = client["skill_gap_analyzer"]


class User(
    BeanieBaseUser,
    Document
):
    pass


async def get_user_db():
    yield BeanieUserDatabase(User)