from app.db import SessionLocal
from app.database_models import User

db = SessionLocal()

new_user = User(
    name="Priya",
    email="priya@gmail.com",
    password_hash="test123",
    role="student"
)

db.add(new_user)
db.commit()

print("User inserted!")