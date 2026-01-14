import React, { useEffect, useState } from "react";
import BottomNavigation from "../../components/feature/BottomNavigation";
import AskezaCompletionMenu from "../../components/feature/AskezaCompletionMenu";
import { dbManager, getTelegramUserId, type AskezaEntry } from "../../utils/database";

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
  notifyEnabled?: boolean;
  notifyTime?: string;
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

  const [showNotifModal, setShowNotifModal] = useState<number | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [notifTime, setNotifTime] = useState("12:00");
  const [notifSaving, setNotifSaving] = useState(false);

  const [selectedIcon, setSelectedIcon] = useState("ri-flashlight-line");
  const [selectedGlowColor, setSelectedGlowColor] = useState("#06b6d4");

  const [newAskeza, setNewAskeza] = useState({
    title: "",
    icon: "ri-flashlight-line",
    color: "from-cyan-400 to-blue-500",
    duration: 30,
    durationType: "custom" as "week" | "month" | "custom",
    notifyEnabled: true,
    notifyTime: "12:00",
  });

  const isAnyModalOpen =
    !!showAddForm || !!showNotifModal || !!showDeleteConfirm || !!showCompletionMenu;

  const tgExpandSafe = () => {
    try {
      (window as any)?.Telegram?.WebApp?.expand?.();
    } catch {
      // ignore
    }
  };

  // Иконки с проверенными названиями (без пустых)
  const iconOptions = [
    "ri-flashlight-line",
    "ri-leaf-line",
    "ri-heart-line",
    "ri-cake-2-line",
    "ri-smartphone-line",
    "ri-drop-line",
    "ri-book-line",
    "ri-run-line",
    "ri-music-line",
    "ri-cup-line",
    "ri-prohibited-line",
    "ri-tv-line",
    "ri-gamepad-line",
    "ri-shopping-cart-line",
    "ri-moon-line",
    "ri-sun-line",
    "ri-mental-health-line",
    "ri-body-scan-line",
    "ri-apple-line",
    "ri-water-flash-line",
    "ri-fire-line",
    "ri-star-line",
    "ri-plant-line",
    "ri-seedling-line",
    "ri-landscape-line",
    "ri-compass-3-line",
    "ri-shield-line",
    "ri-vip-diamond-line",
    "ri-brain-line",
    "ri-eye-line",
    "ri-hand-heart-line",
    "ri-psychotherapy-line",
    "ri-pulse-line",
    "ri-heart-pulse-line",
    "ri-lungs-line",
    "ri-capsule-line",
    "ri-boxing-line",
    "ri-riding-line",
    "ri-walk-line",
    "ri-timer-line",
    "ri-alarm-line",
    "ri-calendar-line",
    "ri-focus-3-line",
    "ri-lightbulb-line",
    "ri-magic-line",
    "ri-rainbow-line",
    "ri-sparkling-2-line",
  ];

  const glowColors = [
    { name: "Голубой", value: "#06b6d4" },
    { name: "Фиолетовый", value: "#8b5cf6" },
    { name: "Розовый", value: "#ec4899" },
    { name: "Зеленый", value: "#10b981" },
    { name: "Желтый", value: "#f59e0b" },
    { name: "Красный", value: "#ef4444" },
    { name: "Оранжевый", value: "#f97316" },
    { name: "Индиго", value: "#6366f1" },
    { name: "Изумрудный", value: "#059669" },
    { name: "Белый", value: "#ffffff" },
  ];

  const colorOptions = [
    { value: "from-cyan-400 to-blue-500", name: "Океан" },
    { value: "from-violet-400 to-purple-600", name: "Аметист" },
    { value: "from-rose-400 to-pink-600", name: "Закат" },
    { value: "from-emerald-400 to-teal-600", name: "Изумруд" },
    { value: "from-amber-400 to-orange-500", name: "Янтарь" },
    { value: "from-indigo-400 to-blue-600", name: "Индиго" },
  ];

  // Database utilities
  const getAnyDb = () => dbManager as any;

  const safeExec = async (sql: string, params: any[] = []) => {
    const anyDb = getAnyDb();
    try {
      if (typeof anyDb.exec === "function") return await anyDb.exec(sql, params);
      if (typeof anyDb.run === "function") return await anyDb.run(sql, params);
      if (typeof anyDb.execute === "function") return await anyDb.execute(sql, params);
      if (typeof anyDb.query === "function") return await anyDb.query(sql, params);
      if (anyDb.db && typeof anyDb.db.exec === "function") return await anyDb.db.exec(sql, params);
      if (anyDb.db && typeof anyDb.db.run === "function") return await anyDb.db.run(sql, params);
    } catch (e) {
      console.warn("SQLite exec failed:", e);
    }
    return null;
  };

  const safeAll = async <T,>(sql: string, params: any[] = []): Promise<T[]> => {
    const anyDb = getAnyDb();
    try {
      if (typeof anyDb.all === "function") return await anyDb.all(sql, params);
      if (typeof anyDb.query === "function") return await anyDb.query(sql, params);
      if (typeof anyDb.select === "function") return await anyDb.select(sql, params);
      if (typeof anyDb.exec === "function") {
        const res = await anyDb.exec(sql, params);
        if (Array.isArray(res)) return res as T[];
        if (res?.rows) return res.rows as T[];
      }
      if (anyDb.db && typeof anyDb.db.all === "function") return await anyDb.db.all(sql, params);
      if (anyDb.db && typeof anyDb.db.query === "function") return await anyDb.db.query(sql, params);
    } catch (e) {
      console.warn("SQLite select failed:", e);
    }
    return [];
  };

  const ensureNotifTable = async () => {
    await safeExec(`
      CREATE TABLE IF NOT EXISTS askeza_reminder_settings (
        telegram_id INTEGER NOT NULL,
        askeza_id   INTEGER NOT NULL,
        time        TEXT    NOT NULL DEFAULT '12:00',
        enabled     INTEGER NOT NULL DEFAULT 1,
        created_at  TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (telegram_id, askeza_id)
      )
    `);
  };

  const loadNotifMap = async (telegramId: number) => {
    const map = new Map<number, { enabled: boolean; time: string }>();
    try {
      await ensureNotifTable();
      const rows = await safeAll<AskezaNotifRow>(
        `SELECT askeza_id, enabled, time FROM askeza_reminder_settings WHERE telegram_id = ?`,
        [telegramId],
      );
      rows.forEach((r) => map.set(r.askeza_id, { enabled: !!r.enabled, time: r.time || "12:00" }));
    } catch (e) {
      console.warn("loadNotifMap failed:", e);
    }
    return map;
  };

  const saveNotif = async (telegramId: number, askezaId: number, enabled: boolean, time: string) => {
    await ensureNotifTable();
    await safeExec(
      `
      INSERT INTO askeza_reminder_settings (telegram_id, askeza_id, time, enabled, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(telegram_id, askeza_id)
      DO UPDATE SET time=excluded.time, enabled=excluded.enabled, updated_at=datetime('now')
    `,
      [telegramId, askezaId, time || "12:00", enabled ? 1 : 0],
    );
  };

  const deleteNotif = async (telegramId: number, askezaId: number) => {
    try {
      await ensureNotifTable();
      await safeExec(`DELETE FROM askeza_reminder_settings WHERE telegram_id = ? AND askeza_id = ?`, [
        telegramId,
        askezaId,
      ]);
    } catch (e) {
      console.warn("deleteNotif failed:", e);
    }
  };

  const checkTodayCompletion = (askeza: AskezaItem): boolean => {
    const today = new Date().toDateString();
    const lastCompleted = localStorage.getItem(`askeza_${askeza.id}_last_completed`);
    return lastCompleted === today;
  };

  useEffect(() => {
    const loadAskezas = async () => {
      try {
        await dbManager.init();
        const telegramId = getTelegramUserId();
        await ensureNotifTable();
        const notifMap = await loadNotifMap(telegramId);
        const dbAskezas = await dbManager.getAskezaEntriesByTelegramId(telegramId);

        const formattedAskezas: AskezaItem[] = dbAskezas.map((askeza) => {
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
            notifyTime: notif ? notif.time : "12:00",
          };
        });

        formattedAskezas.forEach((askeza) => {
          askeza.completedToday = checkTodayCompletion(askeza);
        });

        setAskezas(formattedAskezas);
      } catch (error) {
        console.error("Ошибка загрузки аскез:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAskezas();
  }, []);

  const toggleShowOnHome = async (id: number) => {
    try {
      const askeza = askezas.find((a) => a.id === id);
      if (!askeza) return;
      const newShowOnHome = !askeza.showOnHome;
      await dbManager.updateAskezaEntry(id, { show_on_home: newShowOnHome });
      setAskezas((prev) => prev.map((item) => (item.id === id ? { ...item, showOnHome: newShowOnHome } : item)));
    } catch (error) {
      console.error("Ошибка обновления аскезы:", error);
    }
  };

  const toggleActive = async (id: number) => {
    try {
      const askeza = askezas.find((a) => a.id === id);
      if (!askeza) return;
      const newIsActive = !askeza.isActive;
      await dbManager.updateAskezaEntry(id, { is_active: newIsActive });
      setAskezas((prev) => prev.map((item) => (item.id === id ? { ...item, isActive: newIsActive } : item)));
    } catch (error) {
      console.error("Ошибка обновления аскезы:", error);
    }
  };

  const addAskeza = async () => {
    if (!newAskeza.title.trim()) return;
    try {
      let duration = newAskeza.duration;
      if (newAskeza.durationType === "week") duration = 7;
      if (newAskeza.durationType === "month") duration = 30;

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
        updated_at: now,
      };

      const id = await dbManager.createAskezaEntry(askezaEntry);
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
        notifyTime: newAskeza.notifyTime,
      };

      setAskezas((prev) => [...prev, newAskezaItem]);
      setShowAddForm(false);
      setNewAskeza({
        title: "",
        icon: "ri-flashlight-line",
        color: "from-cyan-400 to-blue-500",
        duration: 30,
        durationType: "custom",
        notifyEnabled: true,
        notifyTime: "12:00",
      });
    } catch (error) {
      console.error("Ошибка создания аскезы:", error);
    }
  };

  const confirmDeleteAskeza = async () => {
    if (!showDeleteConfirm) return;
    try {
      const telegramId = getTelegramUserId();
      await dbManager.deleteAskezaEntry(showDeleteConfirm);
      await deleteNotif(telegramId, showDeleteConfirm);
      setAskezas((prev) => prev.filter((askeza) => askeza.id !== showDeleteConfirm));
      localStorage.removeItem(`askeza_${showDeleteConfirm}_last_completed`);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Ошибка удаления аскезы:", error);
    }
  };

  const handleCompleteAskeza = async (id: number) => {
    try {
      const askeza = askezas.find((a) => a.id === id);
      if (!askeza || askeza.currentDay >= askeza.duration || askeza.completedToday) return;

      const newCurrentDay = askeza.currentDay + 1;
      await dbManager.updateAskezaEntry(id, { current_day: newCurrentDay });

      const today = new Date().toDateString();
      localStorage.setItem(`askeza_${id}_last_completed`, today);

      setAskezas((prev) =>
        prev.map((item) => (item.id === id ? { ...item, currentDay: newCurrentDay, completedToday: true } : item)),
      );

      setShowCompletionMenu(null);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    } catch (error) {
      console.error("Ошибка выполнения аскезы:", error);
    }
  };

  const getButtonState = (askeza: AskezaItem) => {
    if (!askeza.isActive) return "inactive";
    if (askeza.completedToday) return "completed";
    if (askeza.currentDay >= askeza.duration) return "finished";
    return "active";
  };

  const openNotifModal = (askezaId: number) => {
    const a = askezas.find((x) => x.id === askezaId);
    setShowNotifModal(askezaId);
    setNotifEnabled(a?.notifyEnabled ?? true);
    setNotifTime(a?.notifyTime ?? "12:00");
  };

  const saveNotifModal = async () => {
    if (!showNotifModal) return;
    setNotifSaving(true);
    try {
      const telegramId = getTelegramUserId();
      await saveNotif(telegramId, showNotifModal, notifEnabled, notifTime);
      setAskezas((prev) =>
        prev.map((a) => (a.id === showNotifModal ? { ...a, notifyEnabled: notifEnabled, notifyTime: notifTime } : a)),
      );
      setShowNotifModal(null);
    } catch (e) {
      console.error("Ошибка сохранения уведомлений:", e);
    } finally {
      setNotifSaving(false);
    }
  };

  // Liquid Glass Card Component
  const LiquidGlassCard = ({
    children,
    className = "",
    onClick,
    style,
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    style?: React.CSSProperties;
  }) => {
    const baseStyle: React.CSSProperties = {
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.08) 100%)",
      backdropFilter: "blur(40px) saturate(180%)",
      WebkitBackdropFilter: "blur(40px) saturate(180%)",
      border: "1px solid rgba(255,255,255,0.2)",
      boxShadow:
        "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.3), inset 0 -1px 1px rgba(255,255,255,0.1)",
    };

    return (
      <div
        onClick={onClick}
        className={`relative rounded-3xl overflow-hidden transition-all duration-500 md:hover:scale-[1.02] ${className}`}
        style={{ ...baseStyle, ...(style || {}) }}
      >
        {/* Top highlight */}
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        {/* Refraction overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 40%), radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.25) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    );
  };

  // Celebration particles
  const CelebrationParticles = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 40 }, (_, i) => {
        const colors = ["#06b6d4", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#ffffff"];
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-ping"
            style={{
              background: color,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${0.5 + Math.random() * 1}s`,
              boxShadow: `0 0 20px ${color}`,
            }}
          />
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-cyan-400/20 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative pb-24"
      style={{ overscrollBehavior: "none" }}
    >
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[150px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {showCelebration && <CelebrationParticles />}

      {/* Header */}
      <div className="relative z-10 pt-6 pb-4 px-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-white tracking-tight">Аскезы</h1>
            <p className="text-white/40 text-sm mt-1 font-light">Ваши духовные практики</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
              background: "linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(139,92,246,0.3) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 4px 20px rgba(6,182,212,0.3)",
            }}
          >
            <i className="ri-add-line text-white text-xl" />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative z-10 px-5 mb-6">
        <LiquidGlassCard className="p-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-light text-white">{askezas.length}</div>
              <div className="text-xs text-white/40 mt-1">Всего</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light text-cyan-400">{askezas.filter((a) => a.isActive).length}</div>
              <div className="text-xs text-white/40 mt-1">Активных</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light text-emerald-400">
                {askezas.filter((a) => a.completedToday).length}
              </div>
              <div className="text-xs text-white/40 mt-1">Выполнено</div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Askeza List */}
      <div className="relative z-10 px-5 space-y-4">
        {askezas.length === 0 ? (
          <LiquidGlassCard className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-white/5 flex items-center justify-center">
              <i className="ri-seedling-line text-3xl text-white/30" />
            </div>
            <h3 className="text-xl font-light text-white mb-2">Нет аскез</h3>
            <p className="text-white/40 text-sm mb-6">Создайте первую аскезу и начните свой путь</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity"
            >
              Создать аскезу
            </button>
          </LiquidGlassCard>
        ) : (
          askezas.map((askeza) => {
            const progress = (askeza.currentDay / askeza.duration) * 100;
            const buttonState = getButtonState(askeza);

            return (
              <LiquidGlassCard key={askeza.id} className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${askeza.color} flex items-center justify-center flex-shrink-0`}
                    style={{ boxShadow: `0 0 30px ${selectedGlowColor}30` }}
                  >
                    <i className={`${askeza.icon} text-2xl text-white`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title and controls */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-light text-white truncate">{askeza.title}</h3>
                        <p className="text-white/40 text-sm mt-0.5">
                          День {askeza.currentDay}/{askeza.duration}
                        </p>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        {/* Notifications */}
                        <button
                          onClick={() => openNotifModal(askeza.id)}
                          className="w-9 h-9 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                          title="Уведомления"
                        >
                          <i
                            className={`text-lg ${askeza.notifyEnabled ? "ri-notification-3-line text-cyan-400" : "ri-notification-off-line text-white/30"}`}
                          />
                        </button>

                        {/* Show on home */}
                        <button
                          onClick={() => toggleShowOnHome(askeza.id)}
                          className="w-9 h-9 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                          title="Показывать на главной"
                        >
                          <i
                            className={`text-lg ${askeza.showOnHome ? "ri-home-4-line text-emerald-400" : "ri-home-line text-white/30"}`}
                          />
                        </button>

                        {/* Menu */}
                        <button
                          onClick={() => setShowDeleteConfirm(askeza.id)}
                          className="w-9 h-9 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                          title="Удалить"
                        >
                          <i className="ri-more-2-line text-lg text-white/40" />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${askeza.color} transition-all duration-700`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      {/* Active toggle */}
                      <button
                        onClick={() => toggleActive(askeza.id)}
                        className={`px-4 py-2 rounded-2xl text-sm transition-all ${
                          askeza.isActive
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-white/10 text-white/50 hover:bg-white/15"
                        }`}
                      >
                        <i className={`mr-2 ${askeza.isActive ? "ri-play-line" : "ri-pause-line"}`} />
                        {askeza.isActive ? "Активна" : "Пауза"}
                      </button>

                      {/* Complete button */}
                      <button
                        onClick={() => setShowCompletionMenu(askeza.id)}
                        disabled={buttonState !== "active"}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          buttonState === "active"
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-110"
                            : buttonState === "completed"
                              ? "bg-emerald-500/30"
                              : buttonState === "finished"
                                ? "bg-amber-500/30"
                                : "bg-white/10 opacity-50"
                        }`}
                        style={buttonState === "active" ? { boxShadow: "0 4px 20px rgba(0,0,0,0.4)" } : undefined}
                      >
                        <i
                          className={`text-white text-lg ${
                            buttonState === "inactive"
                              ? "ri-lock-line"
                              : buttonState === "completed"
                                ? "ri-check-double-line"
                                : buttonState === "finished"
                                  ? "ri-trophy-line"
                                  : "ri-add-line"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Status badge */}
                    {askeza.completedToday && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                        <i className="ri-check-line" />
                        Выполнено сегодня
                      </div>
                    )}
                  </div>
                </div>
              </LiquidGlassCard>
            );
          })
        )}
      </div>

      {/* Notification Modal */}
      {showNotifModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 overflow-y-auto">
          <div className="min-h-screen pb-24">
            <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-4 py-4 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowNotifModal(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <i className="ri-arrow-left-line text-xl text-white/80" />
                </button>
                <h1 className="text-lg font-semibold text-white">Уведомления</h1>
                <div className="w-10" />
              </div>
            </div>

            <div className="px-4 py-6 space-y-6">
              <LiquidGlassCard className="p-6 md:hover:scale-100">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Напоминание</span>
                    <button
                      onClick={() => setNotifEnabled((v) => !v)}
                      className={`w-14 h-8 rounded-full transition-all ${notifEnabled ? "bg-cyan-500" : "bg-white/20"}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${notifEnabled ? "translate-x-7" : "translate-x-1"}`}
                      />
                    </button>
                  </div>

                  <div className="overflow-hidden">
                    <label className="text-white/50 text-sm mb-2 block">Время</label>
                    <input
                      type="time"
                      value={notifTime}
                      disabled={!notifEnabled}
                      onFocus={tgExpandSafe}
                      onChange={(e) => setNotifTime(e.target.value)}
                      className={`block w-full min-w-0 px-4 py-3 rounded-xl bg-black/20 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                        !notifEnabled ? "opacity-50" : ""
                      }`}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowNotifModal(null)}
                      className="flex-1 py-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={saveNotifModal}
                      disabled={notifSaving}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 transition-opacity"
                    >
                      {notifSaving ? "Сохранение..." : "Сохранить"}
                    </button>
                  </div>
                </div>
              </LiquidGlassCard>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-5">
          <LiquidGlassCard className="w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/20 flex items-center justify-center">
              <i className="ri-delete-bin-line text-rose-400 text-2xl" />
            </div>
            <h3 className="text-xl font-light text-white mb-2">Удалить аскезу?</h3>
            <p className="text-white/50 text-sm mb-6">{askezas.find((a) => a.id === showDeleteConfirm)?.title}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmDeleteAskeza}
                className="flex-1 py-3 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors"
              >
                Удалить
              </button>
            </div>
          </LiquidGlassCard>
        </div>
      )}

      {/* Add Askeza Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 overflow-y-auto">
          <div className="min-h-screen pb-24">
            <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-4 py-4 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <i className="ri-arrow-left-line text-xl text-white/80" />
                </button>
                <h1 className="text-lg font-semibold text-white">Новая аскеза</h1>
                <div className="w-10" />
              </div>
            </div>

            <div className="px-4 py-6 space-y-6">
              <LiquidGlassCard className="p-6 md:hover:scale-100">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="text-white/50 text-sm mb-2 block">Название</label>
                    <input
                      type="text"
                      value={newAskeza.title}
                      onFocus={tgExpandSafe}
                      onChange={(e) => setNewAskeza((prev) => ({ ...prev, title: e.target.value }))}
                      className="block w-full min-w-0 px-4 py-3 rounded-xl bg-black/20 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="30 дней без сладкого"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-white/50 text-sm mb-2 block">Длительность</label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {(["week", "month", "custom"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setNewAskeza((prev) => ({
                              ...prev,
                              durationType: type,
                              duration: type === "week" ? 7 : type === "month" ? 30 : prev.duration,
                            }))
                          }
                          className={`py-2.5 rounded-xl text-sm transition-all ${
                            newAskeza.durationType === type
                              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                              : "bg-white/10 text-white/70 hover:bg-white/20"
                          }`}
                        >
                          {type === "week" ? "Неделя" : type === "month" ? "Месяц" : "Своё"}
                        </button>
                      ))}
                    </div>

                    {newAskeza.durationType === "custom" && (
                      <input
                        type="number"
                        min="1"
                        max="365"
                        inputMode="numeric"
                        value={newAskeza.duration}
                        onFocus={tgExpandSafe}
                        onChange={(e) =>
                          setNewAskeza((prev) => ({ ...prev, duration: parseInt(e.target.value) || 1 }))
                        }
                        className="block w-full min-w-0 px-4 py-3 rounded-xl bg-black/20 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Количество дней"
                      />
                    )}
                  </div>

                  {/* Notifications */}
                  <div className="p-4 rounded-2xl bg-white/5 overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/70 text-sm">Уведомления</span>
                      <button
                        type="button"
                        onClick={() => setNewAskeza((prev) => ({ ...prev, notifyEnabled: !prev.notifyEnabled }))}
                        className={`w-12 h-7 rounded-full transition-all ${newAskeza.notifyEnabled ? "bg-cyan-500" : "bg-white/20"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${newAskeza.notifyEnabled ? "translate-x-6" : "translate-x-1"}`}
                        />
                      </button>
                    </div>

                    {newAskeza.notifyEnabled && (
                      <input
                        type="time"
                        value={newAskeza.notifyTime}
                        onFocus={tgExpandSafe}
                        onChange={(e) => setNewAskeza((prev) => ({ ...prev, notifyTime: e.target.value }))}
                        className="block w-full min-w-0 px-4 py-2.5 rounded-xl bg-black/20 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent box-border"
                      />
                    )}
                  </div>

                  {/* Icon */}
                  <div>
                    <label className="text-white/50 text-sm mb-2 block">Иконка</label>
                    <div className="grid grid-cols-8 gap-2 p-1">
                      {iconOptions.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => {
                            setSelectedIcon(icon);
                            setNewAskeza((prev) => ({ ...prev, icon }));
                          }}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            selectedIcon === icon ? "bg-white/20 scale-110" : "bg-white/5 hover:bg-white/10"
                          }`}
                          style={selectedIcon === icon ? { boxShadow: `0 0 20px ${selectedGlowColor}40` } : undefined}
                        >
                          <i
                            className={`${icon} text-lg`}
                            style={{
                              color: selectedIcon === icon ? selectedGlowColor : "rgba(255,255,255,0.6)",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Glow color */}
                  <div>
                    <label className="text-white/50 text-sm mb-2 block">Цвет свечения</label>
                    <div className="flex gap-2 flex-wrap">
                      {glowColors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setSelectedGlowColor(color.value)}
                          className={`w-8 h-8 rounded-full transition-all ${
                            selectedGlowColor === color.value ? "scale-125 ring-2 ring-white/50" : "hover:scale-110"
                          }`}
                          style={{
                            backgroundColor: color.value,
                            boxShadow: selectedGlowColor === color.value ? `0 0 20px ${color.value}` : undefined,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Gradient color */}
                  <div>
                    <label className="text-white/50 text-sm mb-2 block">Градиент</label>
                    <div className="grid grid-cols-3 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setNewAskeza((prev) => ({ ...prev, color: color.value }))}
                          className={`p-3 rounded-xl transition-all flex items-center gap-2 ${
                            newAskeza.color === color.value
                              ? "ring-2 ring-white/40 bg-white/10"
                              : "bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${color.value}`} />
                          <span className="text-white/70 text-xs">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 py-3.5 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={addAskeza}
                      className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 transition-opacity"
                    >
                      Добавить
                    </button>
                  </div>
                </div>
              </LiquidGlassCard>
            </div>
          </div>
        </div>
      )}

      {/* Completion Menu */}
      {showCompletionMenu && (
        <AskezaCompletionMenu
          isOpen={showCompletionMenu !== null}
          onClose={() => setShowCompletionMenu(null)}
          onComplete={() => handleCompleteAskeza(showCompletionMenu)}
          askezaTitle={askezas.find((a) => a.id === showCompletionMenu)?.title || ""}
          askezaColor={askezas.find((a) => a.id === showCompletionMenu)?.color || "from-cyan-400 to-blue-500"}
        />
      )}

      {!isAnyModalOpen && <BottomNavigation />}
    </div>
  );
}
