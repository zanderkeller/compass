import { useState, useEffect } from 'react';
import BottomNavigation from '../../components/feature/BottomNavigation';
import GlassCard from '../../components/base/GlassCard';
import NeonButton from '../../components/base/NeonButton';
import AskezaCompletionMenu from '../../components/feature/AskezaCompletionMenu';
import { dbManager, getTelegramUserId, type AskezaEntry } from '../../utils/database';

interface AskezaItem {
  id: number;
  title: string;
  icon: string;
  color: string;
  duration: number;
  currentDay: number;
  isActive: boolean;
  showOnHome: boolean;
  completedToday?: boolean;

  // Уведомления (на каждую аскезу)
  notifyEnabled?: boolean;
  notifyTime?: string; // "HH:MM"
}

type AskezaNotifRow = {
  askeza_id: number;
  enabled: number;
  time: string;
};

export default function AskezaPage() {
  const [askezas, setAskezas] = useState<AskezaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCompletionMenu, setShowCompletionMenu] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Модалка уведомлений
  const [showNotifModal, setShowNotifModal] = useState<number | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [notifTime, setNotifTime] = useState('12:00');
  const [notifSaving, setNotifSaving] = useState(false);

  const [selectedIcon, setSelectedIcon] = useState('ri-flashlight-line');
  const [selectedGlowColor, setSelectedGlowColor] = useState('#06b6d4');

  const [newAskeza, setNewAskeza] = useState({
    title: '',
    icon: 'ri-flashlight-line',
    color: 'from-yellow-400 to-orange-500',
    duration: 30,
    durationType: 'custom' as 'week' | 'month' | 'custom',

    // Уведомления для новой аскезы
    notifyEnabled: true,
    notifyTime: '12:00'
  });

  const iconOptions = [
    'ri-flashlight-line', 'ri-leaf-line', 'ri-heart-line', 'ri-cake-line',
    'ri-smartphone-line', 'ri-drop-line', 'ri-book-line', 'ri-run-line',
    'ri-music-line', 'ri-cup-line', 'ri-cigarette-line', 'ri-tv-line',
    'ri-gamepad-line', 'ri-shopping-cart-line', 'ri-moon-line', 'ri-sun-line',
    'ri-meditation-line', 'ri-yoga-line', 'ri-apple-line', 'ri-water-line',
    'ri-fire-line', 'ri-star-line', 'ri-flower-line', 'ri-seedling-line',
    'ri-mountain-line', 'ri-compass-line', 'ri-shield-line', 'ri-gem-line',
    'ri-brain-line', 'ri-eye-line', 'ri-hand-heart-line', 'ri-mental-health-line',
    'ri-pulse-line', 'ri-heart-pulse-line', 'ri-lungs-line', 'ri-capsule-line',
    'ri-dumbbell-line', 'ri-bike-line', 'ri-walk-line', 'ri-timer-line',
    'ri-alarm-line', 'ri-calendar-line', 'ri-focus-line', 'ri-lightbulb-line',
    'ri-magic-line', 'ri-rainbow-line', 'ri-sparkling-line', 'ri-contrast-line',
    'ri-palette-line', 'ri-brush-line', 'ri-pencil-line', 'ri-quill-pen-line',
    'ri-feather-line', 'ri-butterfly-line', 'ri-plant-line', 'ri-cactus-line',
    'ri-tree-line', 'ri-maple-leaf-line', 'ri-cherry-blossom-line', 'ri-rose-line'
  ];

  const glowColors = [
    { name: 'Голубой', value: '#06b6d4' },
    { name: 'Фиолетовый', value: '#8b5cf6' },
    { name: 'Розовый', value: '#ec4899' },
    { name: 'Зеленый', value: '#10b981' },
    { name: 'Желтый', value: '#f59e0b' },
    { name: 'Красный', value: '#ef4444' },
    { name: 'Оранжевый', value: '#f97316' },
    { name: 'Индиго', value: '#6366f1' },
    { name: 'Изумрудный', value: '#059669' },
    { name: 'Лаймовый', value: '#65a30d' },
    { name: 'Янтарный', value: '#d97706' },
    { name: 'Белый', value: '#ffffff' }
  ];

  const colorOptions = [
    { value: 'from-yellow-400 to-orange-500', name: 'Оранжевый' },
    { value: 'from-green-400 to-blue-500', name: 'Зеленый' },
    { value: 'from-purple-400 to-pink-500', name: 'Фиолетовый' },
    { value: 'from-cyan-400 to-blue-500', name: 'Голубой' },
    { value: 'from-red-400 to-pink-500', name: 'Красный' },
    { value: 'from-indigo-400 to-purple-500', name: 'Индиго' },
    { value: 'from-emerald-400 to-teal-500', name: 'Изумрудный' },
    { value: 'from-rose-400 to-pink-500', name: 'Розовый' },
    { value: 'from-amber-400 to-yellow-500', name: 'Янтарный' },
    { value: 'from-violet-400 to-purple-500', name: 'Фиолетовый' },
    { value: 'from-lime-400 to-green-500', name: 'Лаймовый' },
    { value: 'from-sky-400 to-blue-500', name: 'Небесный' }
  ];

  // ---- Утилиты для работы с SQLite через dbManager ----
  // Важно: dbManager у вас уже умеет работать с askeza_entries.
  // Для таблицы askeza_notification_settings ниже используется "best effort":
  // сначала пробуем выполнить SQL через низкоуровневый метод (если он есть),
  // если нет — сохраняем/читаем в localStorage как fallback (чтобы UI не ломался).
  const getAnyDb = () => dbManager as any;

  const safeExec = async (sql: string, params: any[] = []) => {
    const anyDb = getAnyDb();
    try {
      if (typeof anyDb.exec === 'function') return await anyDb.exec(sql, params);
      if (typeof anyDb.run === 'function') return await anyDb.run(sql, params);
      if (typeof anyDb.execute === 'function') return await anyDb.execute(sql, params);
      if (typeof anyDb.query === 'function') return await anyDb.query(sql, params);
      if (anyDb.db && typeof anyDb.db.exec === 'function') return await anyDb.db.exec(sql, params);
      if (anyDb.db && typeof anyDb.db.run === 'function') return await anyDb.db.run(sql, params);
    } catch (e) {
      console.warn('SQLite exec failed:', e);
    }
    return null;
  };

  const safeAll = async <T,>(sql: string, params: any[] = []): Promise<T[]> => {
    const anyDb = getAnyDb();
    try {
      if (typeof anyDb.all === 'function') return await anyDb.all(sql, params);
      if (typeof anyDb.query === 'function') return await anyDb.query(sql, params);
      if (typeof anyDb.select === 'function') return await anyDb.select(sql, params);
      if (typeof anyDb.exec === 'function') {
        const res = await anyDb.exec(sql, params);
        // если exec возвращает { rows } или массив — берём как есть
        if (Array.isArray(res)) return res as T[];
        if (res?.rows) return res.rows as T[];
      }
      if (anyDb.db && typeof anyDb.db.all === 'function') return await anyDb.db.all(sql, params);
      if (anyDb.db && typeof anyDb.db.query === 'function') return await anyDb.db.query(sql, params);
    } catch (e) {
      console.warn('SQLite select failed:', e);
    }
    return [];
  };

  const ensureNotifTable = async () => {
    await safeExec(`
      CREATE TABLE IF NOT EXISTS askeza_notification_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id INTEGER NOT NULL,
        askeza_id INTEGER NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        time TEXT NOT NULL DEFAULT '12:00',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(telegram_id, askeza_id)
      )
    `);

    await safeExec(`
      CREATE INDEX IF NOT EXISTS idx_askeza_notif_tg
      ON askeza_notification_settings (telegram_id)
    `);

    await safeExec(`
      CREATE INDEX IF NOT EXISTS idx_askeza_notif_askeza
      ON askeza_notification_settings (askeza_id)
    `);
  };

  const loadNotifMap = async (telegramId: number) => {
    // Попытка взять из SQLite
    const rows = await safeAll<AskezaNotifRow>(
      `SELECT askeza_id, enabled, time
       FROM askeza_notification_settings
       WHERE telegram_id = ?`,
      [telegramId]
    );

    if (rows.length > 0) {
      const map = new Map<number, { enabled: boolean; time: string }>();
      rows.forEach(r => map.set(Number(r.askeza_id), { enabled: Number(r.enabled) === 1, time: r.time || '12:00' }));
      return map;
    }

    // Fallback: localStorage (чтобы UI не ломался, если в dbManager нет SQL-методов)
    const map = new Map<number, { enabled: boolean; time: string }>();
    try {
      const raw = localStorage.getItem(`askeza_notif_map_${telegramId}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, { enabled: boolean; time: string }>;
        Object.entries(parsed).forEach(([k, v]) => map.set(Number(k), { enabled: !!v.enabled, time: v.time || '12:00' }));
      }
    } catch (_) {}
    return map;
  };

  const saveNotif = async (telegramId: number, askezaId: number, enabled: boolean, time: string) => {
    // SQLite upsert (если доступен)
    const wrote = await safeExec(
      `
      INSERT INTO askeza_notification_settings (telegram_id, askeza_id, enabled, time, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(telegram_id, askeza_id)
      DO UPDATE SET
        enabled = excluded.enabled,
        time = excluded.time,
        updated_at = datetime('now')
      `,
      [telegramId, askezaId, enabled ? 1 : 0, time]
    );

    if (wrote !== null) return;

    // Fallback: localStorage
    try {
      const key = `askeza_notif_map_${telegramId}`;
      const raw = localStorage.getItem(key);
      const obj = raw ? (JSON.parse(raw) as Record<string, { enabled: boolean; time: string }>) : {};
      obj[String(askezaId)] = { enabled, time };
      localStorage.setItem(key, JSON.stringify(obj));
    } catch (_) {}
  };

  const deleteNotif = async (telegramId: number, askezaId: number) => {
    const wrote = await safeExec(
      `DELETE FROM askeza_notification_settings WHERE telegram_id = ? AND askeza_id = ?`,
      [telegramId, askezaId]
    );

    if (wrote !== null) return;

    // Fallback: localStorage
    try {
      const key = `askeza_notif_map_${telegramId}`;
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const obj = JSON.parse(raw) as Record<string, { enabled: boolean; time: string }>;
      delete obj[String(askezaId)];
      localStorage.setItem(key, JSON.stringify(obj));
    } catch (_) {}
  };

  // Проверка выполнения аскезы сегодня (пока оставляем как есть)
  const checkTodayCompletion = (askeza: AskezaItem): boolean => {
    const today = new Date().toDateString();
    const lastCompleted = localStorage.getItem(`askeza_${askeza.id}_last_completed`);
    return lastCompleted === today;
  };

  // Загрузка аскез из базы + подмешиваем уведомления
  useEffect(() => {
    const loadAskezas = async () => {
      try {
        await dbManager.init();
        const telegramId = getTelegramUserId();

        await ensureNotifTable();
        const notifMap = await loadNotifMap(telegramId);

        const dbAskezas = await dbManager.getAskezaEntriesByTelegramId(telegramId);

        const formattedAskezas: AskezaItem[] = dbAskezas.map(askeza => {
          const notif = notifMap.get(askeza.id!);
          return {
            id: askeza.id!,
            title: askeza.title,
            icon: askeza.icon,
            color: askeza.color,
            duration: askeza.duration,
            currentDay: askeza.current_day,
            isActive: askeza.is_active,
            showOnHome: askeza.show_on_home,
            completedToday: false,

            notifyEnabled: notif ? notif.enabled : true,
            notifyTime: notif ? notif.time : '12:00'
          };
        });

        formattedAskezas.forEach(askeza => {
          askeza.completedToday = checkTodayCompletion(askeza);
        });

        setAskezas(formattedAskezas);
      } catch (error) {
        console.error('Ошибка загрузки аскез:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAskezas();
  }, []);

  const toggleShowOnHome = async (id: number) => {
    try {
      const askeza = askezas.find(a => a.id === id);
      if (!askeza) return;

      const newShowOnHome = !askeza.showOnHome;
      await dbManager.updateAskezaEntry(id, { show_on_home: newShowOnHome });

      setAskezas(prev => prev.map(item =>
        item.id === id ? { ...item, showOnHome: newShowOnHome } : item
      ));
    } catch (error) {
      console.error('Ошибка обновления аскезы:', error);
    }
  };

  const toggleActive = async (id: number) => {
    try {
      const askeza = askezas.find(a => a.id === id);
      if (!askeza) return;

      const newIsActive = !askeza.isActive;
      await dbManager.updateAskezaEntry(id, { is_active: newIsActive });

      setAskezas(prev => prev.map(item =>
        item.id === id ? { ...item, isActive: newIsActive } : item
      ));
    } catch (error) {
      console.error('Ошибка обновления аскезы:', error);
    }
  };

  const addAskeza = async () => {
    if (!newAskeza.title.trim()) return;

    try {
      let duration = newAskeza.duration;
      if (newAskeza.durationType === 'week') duration = 7;
      if (newAskeza.durationType === 'month') duration = 30;

      const telegramId = getTelegramUserId();
      const now = new Date().toISOString();

      const askezaEntry: AskezaEntry = {
        telegram_id: telegramId,
        title: newAskeza.title,
        icon: newAskeza.icon,
        color: newAskeza.color,
        duration,
        current_day: 0,
        is_active: true,
        show_on_home: true,
        created_at: now,
        updated_at: now
      };

      const id = await dbManager.createAskezaEntry(askezaEntry);

      // Сохраняем настройки уведомлений для новой аскезы
      await saveNotif(telegramId, id, newAskeza.notifyEnabled, newAskeza.notifyTime);

      const newAskezaItem: AskezaItem = {
        id,
        title: newAskeza.title,
        icon: newAskeza.icon,
        color: newAskeza.color,
        duration,
        currentDay: 1,
        isActive: true,
        showOnHome: true,
        completedToday: false,
        notifyEnabled: newAskeza.notifyEnabled,
        notifyTime: newAskeza.notifyTime
      };

      setAskezas(prev => [...prev, newAskezaItem]);
      setNewAskeza({
        title: '',
        icon: 'ri-flashlight-line',
        color: 'from-yellow-400 to-orange-500',
        duration: 30,
        durationType: 'custom',
        notifyEnabled: true,
        notifyTime: '12:00'
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Ошибка создания аскезы:', error);
    }
  };

  const confirmDeleteAskeza = async () => {
    if (!showDeleteConfirm) return;

    try {
      const telegramId = getTelegramUserId();

      await dbManager.deleteAskezaEntry(showDeleteConfirm);
      await deleteNotif(telegramId, showDeleteConfirm);

      setAskezas(prev => prev.filter(askeza => askeza.id !== showDeleteConfirm));
      localStorage.removeItem(`askeza_${showDeleteConfirm}_last_completed`);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Ошибка удаления аскезы:', error);
    }
  };

  const handleCompleteAskeza = async (id: number) => {
    try {
      const askeza = askezas.find(a => a.id === id);
      if (!askeza || askeza.currentDay >= askeza.duration || askeza.completedToday) return;

      const newCurrentDay = askeza.currentDay + 1;
      await dbManager.updateAskezaEntry(id, { current_day: newCurrentDay });

      const today = new Date().toDateString();
      localStorage.setItem(`askeza_${id}_last_completed`, today);

      setAskezas(prev => prev.map(item =>
        item.id === id ? { ...item, currentDay: newCurrentDay, completedToday: true } : item
      ));

      setShowCompletionMenu(null);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    } catch (error) {
      console.error('Ошибка выполнения аскезы:', error);
    }
  };

  const getButtonState = (askeza: AskezaItem) => {
    if (!askeza.isActive) return 'inactive';
    if (askeza.completedToday) return 'completed';
    if (askeza.currentDay >= askeza.duration) return 'finished';
    return 'active';
  };

  const openNotifModal = (askezaId: number) => {
    const a = askezas.find(x => x.id === askezaId);
    setShowNotifModal(askezaId);
    setNotifEnabled(a?.notifyEnabled ?? true);
    setNotifTime(a?.notifyTime ?? '12:00');
  };

  const saveNotifModal = async () => {
    if (!showNotifModal) return;
    setNotifSaving(true);
    try {
      const telegramId = getTelegramUserId();
      await saveNotif(telegramId, showNotifModal, notifEnabled, notifTime);

      setAskezas(prev => prev.map(a =>
        a.id === showNotifModal ? { ...a, notifyEnabled: notifEnabled, notifyTime: notifTime } : a
      ));
      setShowNotifModal(null);
    } catch (e) {
      console.error('Ошибка сохранения уведомлений:', e);
    } finally {
      setNotifSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Загрузка аскез...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Анимация салюта */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 30 }, (_, i) => {
            const colors = [
              'bg-yellow-400',
              'bg-orange-500',
              'bg-pink-500',
              'bg-purple-500',
              'bg-red-500',
              'bg-green-500'
            ];
            return (
              <div
                key={i}
                className="absolute animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              >
                <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`}></div>
              </div>
            );
          })}

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center animate-bounce">
              <div className="text-6xl mb-4">🎉</div>
              <div className="text-white text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Отлично!
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 pb-28">
        {/* Хедер */}
        <div className="pt-6 pb-4 px-4">
          <div className="text-center mb-4">
            <div
              className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
              style={{ boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)' }}
            >
              <i className="ri-flashlight-line text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
              Аскезы
            </h1>
            <p className="text-white/60 text-sm">Управляйте своими практиками</p>
          </div>
        </div>

        {/* Кнопка добавления */}
        <div className="px-4 mb-6">
          <NeonButton className="w-full py-3" onClick={() => setShowAddForm(true)}>
            <i className="ri-add-line mr-2"></i>
            Добавить новую аскезу
          </NeonButton>
        </div>

        {/* Список аскез */}
        <div className="px-4 space-y-4">
          {askezas.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-gray-400 to-gray-600 opacity-50">
                <i className="ri-flashlight-line text-white text-2xl"></i>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Нет аскез</h3>
              <p className="text-white/60 text-sm">Добавьте первую аскезу</p>
            </GlassCard>
          ) : (
            askezas.map(askeza => {
              const progress = (askeza.currentDay / askeza.duration) * 100;
              const buttonState = getButtonState(askeza);

              return (
                <GlassCard key={askeza.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className={`w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r ${askeza.color}`}
                        style={{ boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)' }}
                      >
                        <i className={`${askeza.icon} text-white text-xl`}></i>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-white text-base font-semibold">{askeza.title}</h3>
                        <p className="text-white/70 text-sm">
                          День {askeza.currentDay} из {askeza.duration}
                        </p>

                        <div className="flex items-center gap-2 mt-1">
                          <div className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                            <i className={(askeza.notifyEnabled ?? true) ? 'ri-notification-3-line' : 'ri-notification-off-line'}></i>
                            <span>{(askeza.notifyEnabled ?? true) ? (askeza.notifyTime ?? '12:00') : 'выкл'}</span>
                          </div>

                          {askeza.completedToday && (
                            <span className="text-green-400 text-xs">✓ Выполнено сегодня</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openNotifModal(askeza.id)}
                        className="text-white/70 hover:text-white transition-colors p-1"
                        title="Уведомления"
                      >
                        <i className="ri-notification-3-line text-lg"></i>
                      </button>

                      <button
                        onClick={() => setShowDeleteConfirm(askeza.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                        title="Удалить"
                      >
                        <i className="ri-delete-bin-line text-lg"></i>
                      </button>
                    </div>
                  </div>

                  {/* Прогресс-бар */}
                  <div className="mb-4">
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${askeza.color} rounded-full transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-white/60 text-xs">0%</span>
                      <span className="text-cyan-400 text-xs font-semibold">{Math.round(progress)}%</span>
                      <span className="text-white/60 text-xs">100%</span>
                    </div>
                  </div>

                  {/* Настройки */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={askeza.isActive}
                          onChange={() => toggleActive(askeza.id)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            askeza.isActive ? 'bg-green-500 border-green-500' : 'border-white/30'
                          }`}
                        >
                          {askeza.isActive && <i className="ri-check-line text-white text-sm"></i>}
                        </div>
                        <span className="text-white/70 text-sm">Активна</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={askeza.showOnHome}
                          onChange={() => toggleShowOnHome(askeza.id)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            askeza.showOnHome ? 'bg-cyan-500 border-cyan-500' : 'border-white/30'
                          }`}
                        >
                          {askeza.showOnHome && <i className="ri-check-line text-white text-sm"></i>}
                        </div>
                        <span className="text-white/70 text-sm">На главной</span>
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          if (buttonState === 'active') setShowCompletionMenu(askeza.id);
                        }}
                        disabled={buttonState !== 'active'}
                        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group ${
                          buttonState === 'inactive'
                            ? 'bg-gray-500/30 cursor-not-allowed'
                            : buttonState === 'completed'
                            ? 'bg-green-500/50 cursor-not-allowed'
                            : buttonState === 'finished'
                            ? 'bg-yellow-500/50 cursor-not-allowed'
                            : `bg-gradient-to-r ${askeza.color} hover:scale-110 cursor-pointer`
                        }`}
                        style={buttonState === 'active' ? { boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)' } : undefined}
                      >
                        <i
                          className={`text-white text-xl transition-transform duration-300 ${
                            buttonState === 'inactive'
                              ? 'ri-lock-line'
                              : buttonState === 'completed'
                              ? 'ri-check-line'
                              : buttonState === 'finished'
                              ? 'ri-trophy-line'
                              : 'ri-add-line group-hover:rotate-90'
                          }`}
                        ></i>
                        {buttonState === 'active' && (
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        )}
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      </div>

      {/* Модалка уведомлений */}
      {showNotifModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Уведомления</h3>
              <button
                onClick={() => setShowNotifModal(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <i className="ri-notification-3-line text-cyan-300"></i>
                    <span className="text-white/80 text-sm">Включить напоминание</span>
                  </div>

                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={notifEnabled}
                      onChange={() => setNotifEnabled(v => !v)}
                      className="sr-only"
                    />
                    <div className={`w-12 h-7 rounded-full transition-all ${notifEnabled ? 'bg-cyan-500/80' : 'bg-white/15'}`}></div>
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                        notifEnabled ? 'left-6' : 'left-1'
                      }`}
                      style={notifEnabled ? { boxShadow: '0 0 18px rgba(34, 211, 238, 0.5)' } : undefined}
                    ></div>
                  </div>
                </label>

                <div className="mt-3">
                  <label className="block text-white/70 text-sm mb-2">Время</label>
                  <input
                    type="time"
                    value={notifTime}
                    disabled={!notifEnabled}
                    onChange={e => setNotifTime(e.target.value)}
                    className={`w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400 ${
                      !notifEnabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <NeonButton
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowNotifModal(null)}
                  disabled={notifSaving}
                >
                  Отмена
                </NeonButton>

                <NeonButton
                  className="flex-1"
                  onClick={saveNotifModal}
                  disabled={notifSaving}
                >
                  {notifSaving ? 'Сохранение...' : 'Сохранить'}
                </NeonButton>
              </div>

              <p className="text-white/50 text-xs">
                Настройки сохраняются в SQLite и используются ботом для напоминаний по аскезам.
              </p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Окно подтверждения удаления */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-sm p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-500/20">
                <i className="ri-delete-bin-line text-red-400 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Удалить аскезу?</h3>
              <p className="text-white/70 text-sm mb-1">
                {askezas.find(a => a.id === showDeleteConfirm)?.title}
              </p>
              <p className="text-white/50 text-xs">Это действие нельзя отменить</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={confirmDeleteAskeza}
                className="w-full py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              >
                <i className="ri-delete-bin-line mr-2"></i>
                Удалить
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
              >
                <i className="ri-close-line mr-2"></i>
                Отмена
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Меню выполнения аскезы */}
      {showCompletionMenu && (
        <AskezaCompletionMenu
          isOpen={showCompletionMenu !== null}
          onClose={() => setShowCompletionMenu(null)}
          onComplete={() => handleCompleteAskeza(showCompletionMenu)}
          askezaTitle={askezas.find(a => a.id === showCompletionMenu)?.title || ''}
          askezaColor={askezas.find(a => a.id === showCompletionMenu)?.color || 'from-yellow-400 to-orange-500'}
        />
      )}

      {/* Форма добавления аскезы */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Новая аскеза</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              {/* Название */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Название</label>
                <input
                  type="text"
                  value={newAskeza.title}
                  onChange={e => setNewAskeza(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
                  placeholder="Например: 30 дней без сладкого"
                />
              </div>

              {/* Уведомления */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="ri-notification-3-line text-cyan-300"></i>
                    <span className="text-white/80 text-sm">Уведомление</span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAskeza.notifyEnabled}
                      onChange={() => setNewAskeza(prev => ({ ...prev, notifyEnabled: !prev.notifyEnabled }))}
                      className="sr-only"
                    />
                    <div className={`w-12 h-7 rounded-full transition-all ${newAskeza.notifyEnabled ? 'bg-cyan-500/80' : 'bg-white/15'}`}></div>
                    <div
                      className={`absolute translate-x-0 w-5 h-5 rounded-full bg-white transition-all`}
                      style={{
                        marginLeft: newAskeza.notifyEnabled ? 24 : 4,
                        marginTop: -2,
                        boxShadow: newAskeza.notifyEnabled ? '0 0 18px rgba(34, 211, 238, 0.5)' : undefined
                      }}
                    ></div>
                  </label>
                </div>

                <div className="mt-3">
                  <label className="block text-white/70 text-sm mb-2">Время</label>
                  <input
                    type="time"
                    value={newAskeza.notifyTime}
                    disabled={!newAskeza.notifyEnabled}
                    onChange={e => setNewAskeza(prev => ({ ...prev, notifyTime: e.target.value }))}
                    className={`w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400 ${
                      !newAskeza.notifyEnabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Длительность */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Длительность</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    onClick={() => setNewAskeza(prev => ({ ...prev, durationType: 'week', duration: 7 }))}
                    className={`py-2 px-3 rounded-lg text-sm transition-all ${
                      newAskeza.durationType === 'week' ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    Неделя
                  </button>
                  <button
                    onClick={() => setNewAskeza(prev => ({ ...prev, durationType: 'month', duration: 30 }))}
                    className={`py-2 px-3 rounded-lg text-sm transition-all ${
                      newAskeza.durationType === 'month' ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    Месяц
                  </button>
                  <button
                    onClick={() => setNewAskeza(prev => ({ ...prev, durationType: 'custom' }))}
                    className={`py-2 px-3 rounded-lg text-sm transition-all ${
                      newAskeza.durationType === 'custom' ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    Свое
                  </button>
                </div>

                {newAskeza.durationType === 'custom' && (
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={newAskeza.duration}
                    onChange={e => setNewAskeza(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    placeholder="Количество дней"
                  />
                )}
              </div>

              {/* Иконка */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Иконка</label>
                <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      onClick={() => {
                        setSelectedIcon(icon);
                        setNewAskeza(prev => ({ ...prev, icon }));
                      }}
                      className={`p-3 rounded-lg transition-all border-2 ${
                        selectedIcon === icon ? 'border-white/50 bg-white/10' : 'border-transparent bg-white/5 hover:bg-white/10'
                      }`}
                      style={selectedIcon === icon ? { boxShadow: `0 0 15px ${selectedGlowColor}`, filter: `drop-shadow(0 0 8px ${selectedGlowColor})` } : undefined}
                    >
                      <i
                        className={`${icon} text-xl`}
                        style={selectedIcon === icon
                          ? { color: selectedGlowColor, textShadow: `0 0 10px ${selectedGlowColor}` }
                          : { color: 'rgba(255, 255, 255, 0.7)' }}
                      ></i>
                    </button>
                  ))}
                </div>
              </div>

              {/* Цвет свечения */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Цвет свечения</label>
                <div className="grid grid-cols-6 gap-2">
                  {glowColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedGlowColor(color.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedGlowColor === color.value ? 'border-white/50 scale-110' : 'border-white/20 hover:border-white/40'
                      }`}
                      style={{
                        backgroundColor: color.value,
                        boxShadow: selectedGlowColor === color.value ? `0 0 15px ${color.value}` : undefined
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Цвет градиента */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Цвет градиента</label>
                <div className="grid grid-cols-2 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setNewAskeza(prev => ({ ...prev, color: color.value }))}
                      className={`p-3 rounded-lg transition-all flex items-center space-x-2 ${
                        newAskeza.color === color.value ? 'ring-2 ring-white/50' : 'hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${color.value}`}></div>
                      <span className="text-white/70 text-sm">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex space-x-3 pt-4">
                <NeonButton variant="secondary" className="flex-1" onClick={() => setShowAddForm(false)}>
                  Отмена
                </NeonButton>
                <NeonButton className="flex-1" onClick={addAskeza}>
                  Добавить
                </NeonButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
