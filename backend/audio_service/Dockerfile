FROM python:3.12-slim

WORKDIR /app

RUN pip install poetry

COPY audio_service/ .

RUN poetry install

CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
