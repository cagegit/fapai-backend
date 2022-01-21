FROM python:3.9

WORKDIR /backend/backend

COPY ./backend/requirements.txt /backend/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /backend/requirements.txt

COPY ./backend /backend/backend

# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
CMD ["gunicorn", "main:app", "-w", "2", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:9000"]