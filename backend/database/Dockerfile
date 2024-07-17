FROM python:3.12-slim

WORKDIR /app

RUN pip install poetry

COPY . .

RUN poetry install

ENTRYPOINT ["poetry", "run", "python", "-m", "database.database"]