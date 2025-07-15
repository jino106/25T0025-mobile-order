# ベースイメージとして公式Pythonイメージを使用
FROM python:3.13-slim

# 環境変数の設定
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 作業ディレクトリの設定
WORKDIR /app

# 依存関係をインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 依存パッケージをインストールß
RUN pip install psycopg2-binary


# プロジェクトファイルをコピー
COPY . .

# コレクトスタティック（本番環境用）ß
# RUN python manage.py collectstatic --noinput

# コンテナ起動時のコマンド
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]