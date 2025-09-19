-- タイムスタンプカラムのデフォルト値を修正するマイグレーション
-- pgAdminで直接実行してください

-- officesテーブルの修正
ALTER TABLE offices 
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN updated_at SET DEFAULT NOW(),
ALTER COLUMN is_active SET DEFAULT true;

-- staffsテーブルの修正
ALTER TABLE staffs 
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN updated_at SET DEFAULT NOW();

-- time_recordsテーブルの修正
ALTER TABLE time_records 
ALTER COLUMN created_at SET DEFAULT NOW();

-- usersテーブルの修正（既にserver_default=func.now()が設定されているが、念のため）
ALTER TABLE users 
ALTER COLUMN created_at SET DEFAULT NOW();

-- 既存のNULL値を現在時刻で更新
UPDATE offices SET created_at = NOW() WHERE created_at IS NULL;
UPDATE offices SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE offices SET is_active = true WHERE is_active IS NULL;

UPDATE staffs SET created_at = NOW() WHERE created_at IS NULL;
UPDATE staffs SET updated_at = NOW() WHERE updated_at IS NULL;

UPDATE time_records SET created_at = NOW() WHERE created_at IS NULL;

UPDATE users SET created_at = NOW() WHERE created_at IS NULL;
