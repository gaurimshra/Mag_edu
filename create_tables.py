from app.db import engine
from app.database_models import Base

print("Creating tables...")

Base.metadata.create_all(bind=engine)

print("Tables created successfully!")