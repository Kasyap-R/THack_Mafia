FROM python:3.12-slim

WORKDIR /app

RUN pip install poetry

COPY meeting_service/ .
COPY ../database/ ../database/

RUN poetry install

CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
