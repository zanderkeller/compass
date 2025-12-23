CREATE TABLE IF NOT EXISTS askeza_notification_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id INTEGER NOT NULL,
  askeza_id INTEGER NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  time TEXT NOT NULL DEFAULT '12:00',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(telegram_id, askeza_id),
  FOREIGN KEY (telegram_id) REFERENCES users(telegram_id) ON DELETE CASCADE,
  FOREIGN KEY (askeza_id) REFERENCES askeza_entries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_askeza_notif_tg
ON askeza_notification_settings(telegram_id);

CREATE INDEX IF NOT EXISTS idx_askeza_notif_askeza
ON askeza_notification_settings(askeza_id);
