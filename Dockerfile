FROM python:3.9

WORKDIR /backend/backend

COPY ./backend/requirements.txt /backend/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /backend/requirements.txt

COPY ./backend /backend/backend

ENV POSTGRESQL_URI="postgresql+asyncpg://postgres:cage%40159357@172.21.32.2:5432/auction"

# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
CMD ["gunicorn", "main:app", "-w", "2", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:9000"]