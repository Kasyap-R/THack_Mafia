FROM python:3.12-slim

WORKDIR /app

RUN pip install poetry

COPY . .

RUN poetry install

CMD ["poetry", "run", "uvicorn", "auth_service.main:app", "--host", "0.0.0.0", "--port", "8000"]