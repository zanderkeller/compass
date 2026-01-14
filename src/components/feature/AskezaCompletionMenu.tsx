import { useState, useEffect, useMemo } from "react";

interface AskezaCompletionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  askezaTitle: string;
  askezaColor: string;
  currentDay: number;  // ОБЯЗАТЕЛЬНО
  totalDays: number;   // ОБЯЗАТЕЛЬНО
}

export default function AskezaCompletionMenu({
  isOpen,
  onClose,
  onComplete,
  askezaTitle,
  askezaColor,
  currentDay,
  totalDays,
}: AskezaCompletionMenuProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [motivationText, setMotivationText] = useState("");

  const safeTotalDays = useMemo(() => Math.max(1, Number(totalDays) || 1), [totalDays]);
  const safeCurrentDay = useMemo(() => {
    const n = Number(currentDay);
    if (!Number.isFinite(n)) return 0;
    return Math.min(Math.max(0, n), safeTotalDays - 1);
  }, [currentDay, safeTotalDays]);

  const isLastDay = safeCurrentDay + 1 === safeTotalDays;

  const getMotivationMessage = (progress: number) => {
    if (progress < 0.2) {
      return [
        "Отличное начало! Первые шаги самые важные! 🌱",
        "Вы на правильном пути! Каждый день приближает к цели! ✨",
        "Великолепно! Начало положено, продолжайте в том же духе! 🚀",
      ];
    } else if (progress < 0.4) {
      return [
        "Прекрасный прогресс! Вы уже формируете новую привычку! 💪",
        "Замечательно! Ваша сила воли крепнет с каждым днем! 🔥",
        "Отлично! Вы доказываете себе, что можете все! ⭐",
      ];
    } else if (progress < 0.6) {
      return [
        "Невероятно! Вы уже прошли почти половину пути! 🎯",
        "Потрясающе! Ваша дисциплина вдохновляет! 🌟",
        "Браво! Вы становитесь сильнее с каждым днем! 💎",
      ];
    } else if (progress < 0.8) {
      return [
        "Фантастика! Финишная прямая уже близко! 🏆",
        "Восхитительно! Ваша целеустремленность поражает! 🔥",
        "Великолепно! Вы почти у цели, не останавливайтесь! 🚀",
      ];
    } else {
      return [
        "НЕВЕРОЯТНО! Вы почти достигли совершенства! 🏆✨",
        "ПОТРЯСАЮЩЕ! Ваша сила духа безгранична! 💎🔥",
        "ФЕНОМЕНАЛЬНО! Вы - настоящий мастер самодисциплины! 👑⭐",
      ];
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const progress = safeCurrentDay / safeTotalDays;
    const messages = getMotivationMessage(progress);
    setMotivationText(messages[Math.floor(Math.random() * messages.length)]);
  }, [isOpen, safeCurrentDay, safeTotalDays]);

  const handleComplete = () => {
    setShowCelebration(true);

    const ms = isLastDay ? 5000 : 3000;
    window.setTimeout(() => {
      onComplete();
      setShowCelebration(false);
      onClose();
    }, ms);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: isLastDay ? 100 : 50 }, (_, i) => {
              const colors = ["#06b6d4", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7"];
              const color = colors[i % colors.length];
              const size = isLastDay ? 4 + Math.random() * 8 : 3 + Math.random() * 5;
              const startX = 50 + (Math.random() - 0.5) * 20;
              const endX = Math.random() * 100;
              const endY = Math.random() * 100;

              const dx = `${(endX - startX).toFixed(2)}vw`;
              const dy = `${(endY - 50).toFixed(2)}vh`;

              const delay = Math.random() * 0.5;
              const duration = 1.5 + Math.random() * 1.5;

              return (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: size,
                    height: size,
                    background: color,
                    boxShadow: `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}`,
                    left: `${startX}%`,
                    top: "50%",
                    animation: `particle ${duration}s ease-out ${delay}s forwards`,
                    willChange: "transform, opacity",
                    ["--dx" as any]: dx,
                    ["--dy" as any]: dy,
                  }}
                />
              );
            })}

            {isLastDay && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center animate-scale-in">
                  <div className="text-8xl mb-6 animate-bounce">👑</div>
                  <div
                    className="text-4xl font-bold mb-4"
                    style={{
                      background: "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899, #8b5cf6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textShadow: "0 0 60px rgba(251, 191, 36, 0.5)",
                      animation: "text-glow 1s ease-in-out infinite alternate",
                    }}
                  >
                    АСКЕЗА ЗАВЕРШЕНА!
                  </div>
                  <div className="text-white/90 text-xl max-w-md mx-auto px-4 mb-4">
                    Вы прошли путь от начала до конца!
                  </div>
                  <div className="text-cyan-400 text-lg">{safeTotalDays} дней силы духа! 💎</div>
                </div>
              </div>
            )}
          </div>
        )}

        {!showCelebration && (
          <div
            className="relative rounded-3xl p-6 w-full max-w-sm overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
              backdropFilter: "blur(40px) saturate(200%)",
              WebkitBackdropFilter: "blur(40px) saturate(200%)",
              boxShadow: "0 25px 50px rgba(0,0,0,0.4), 0 0 40px rgba(6,182,212,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="relative z-10 text-center">
              <div
                className={`w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br ${askezaColor}`}
                style={{ boxShadow: "0 0 40px rgba(6,182,212,0.4), 0 0 80px rgba(6,182,212,0.2)" }}
              >
                <i className="ri-fire-fill text-white text-4xl" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                {isLastDay ? "Финальный день!" : "Подтвердить выполнение"}
              </h3>
              <p className="text-white/70 text-sm mb-2">{askezaTitle}</p>
              <p className="text-cyan-400 text-sm mb-6">
                День {safeCurrentDay + 1} из {safeTotalDays} • {Math.round(((safeCurrentDay + 1) / safeTotalDays) * 100)}%
              </p>

              <div
                className="rounded-2xl p-4 mb-6"
                style={{
                  background: "rgba(6,182,212,0.1)",
                  border: "1px solid rgba(6,182,212,0.2)",
                }}
              >
                <p className="text-white/90 text-sm leading-relaxed">
                  {isLastDay ? "🏆 Это последний день! Завершите аскезу и получите награду!" : motivationText}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleComplete}
                  className={`w-full py-4 px-4 rounded-2xl bg-gradient-to-r ${askezaColor} text-white font-semibold transition-all active:scale-95`}
                  style={{ boxShadow: "0 0 30px rgba(6,182,212,0.4), 0 10px 40px rgba(0,0,0,0.3)" }}
                >
                  <i className="ri-check-double-line mr-2 text-lg" />
                  {isLastDay ? "Завершить аскезу!" : "Выполнено!"}
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-2xl text-white/70 font-medium transition-all hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes particle {
          to {
            transform: translate3d(var(--dx, 0px), var(--dy, -200px), 0) scale(0);
            opacity: 0;
          }
        }
        @keyframes text-glow {
          0% { filter: drop-shadow(0 0 20px rgba(251,191,36,0.5)); }
          100% { filter: drop-shadow(0 0 40px rgba(236,72,153,0.8)); }
        }
        @keyframes animate-scale-in {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: animate-scale-in 0.5s ease-out forwards; }
      `}</style>
    </>
  );
}
