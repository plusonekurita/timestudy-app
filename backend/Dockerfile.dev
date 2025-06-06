FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ソースコードをコピー
COPY ./app ./app

# --reloadでdocker内でほっとリロードを行うのでメモリ消費大、エラーが出る場合は消してpythonの開発だけローカルで行う
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
