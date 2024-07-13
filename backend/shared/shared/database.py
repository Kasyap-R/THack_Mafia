from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from .models import Base
import os

DATABASE_URL = os.getenv("DATABASE_URL", "mysql://user:password@db:3306/hackathon_db")

# Creates SQLAlchemy engine with a pool of connections to our database
# Starts from 10 connections and can go up to 20
engine = create_engine(DATABASE_URL, pool_size=10, max_overflow=20)

# Creates a session factory. Sessions are what we use to interact with the database through connections.
# Essentially sessions translate our queries into SQL and sends that SQL through connections
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Creates a session to interact with the database from
# Each endpoint that needs acccess to the database will be given a session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    # Create all tables (if they dont' exist)
    Base.metadata.create_all(engine)
    print("Database tables created.")

#### Example usage of get_db() with a FastAPI endpoint
# @app.get("/users/{user_id}")
# def read_user(user_id: int, db: Session = Depends(get_db)):
#     return db.query(User).filter(User.id == user_id).first()
#### FastAPI will automatically call .next() on db upon completion of the function which triggers
#### the finally block in get_db() and closes that connection

#### Example of how sessions and connections work
# Using a session (high-level)
# user = session.query(User).filter(User.id == 1).first()
# user.name = "New Name"
# session.commit()

# What the session does behind the scenes (simplified):
# 1. Session translates the query to SQL
# 2. Acquires a connection from the pool
# 3. Sends SQL: "SELECT * FROM users WHERE id = 1 LIMIT 1"
# 4. Receives result and creates a User object
# 5. Tracks the change to user.name
# 6. On commit, translates change to SQL: "UPDATE users SET name = 'New Name' WHERE id = 1"
# 7. Sends this SQL via the connection
# 8. Returns the connection to the pool
####
