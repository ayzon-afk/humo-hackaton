-- Документы всех коллекций в одной таблице: коллекции под тему хакатона создаются без новых миграций.
-- JSONB даёт гибкие поля, индексы — быстрые выборки по коллекции, дате и содержимому.
CREATE TABLE IF NOT EXISTS documents (
  collection TEXT        NOT NULL,
  id         TEXT        NOT NULL,
  data       JSONB       NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,
  PRIMARY KEY (collection, id)
);

CREATE INDEX IF NOT EXISTS documents_collection_created_idx ON documents (collection, created_at DESC);
CREATE INDEX IF NOT EXISTS documents_data_idx ON documents USING GIN (data jsonb_path_ops);

-- Один email — один пользователь (без учёта регистра)
CREATE UNIQUE INDEX IF NOT EXISTS documents_users_email_idx
  ON documents (lower(data->>'email'))
  WHERE collection = 'users';
