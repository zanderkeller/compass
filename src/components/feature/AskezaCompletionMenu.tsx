
import { useState, useEffect } from 'react';

interface AskezaCompletionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  askezaTitle: string;
  askezaColor: string;
  currentDay?: number;
  totalDays?: number;
}

export default function AskezaCompletionMenu({ 
  isOpen, 
  onClose, 
  onComplete, 
  askezaTitle, 
  askezaColor,
  currentDay = 0,
  totalDays = 1
}: AskezaCompletionMenuProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [motivationText, setMotivationText] = useState('');

  // Мотивационные сообщения в зависимости от прогресса
  const getMotivationMessage = (progress: number) => {
    if (progress < 0.2) {
      return [
        "Отличное начало! Первые шаги самые важные! 🌱",
        "Вы на правильном пути! Каждый день приближает к цели! ✨",
        "Великолепно! Начало положено, продолжайте в том же духе! 🚀"
      ];
    } else if (progress < 0.4) {
      return [
        "Прекрасный прогресс! Вы уже формируете новую привычку! 💪",
        "Замечательно! Ваша сила воли крепнет с каждым днем! 🔥",
        "Отлично! Вы доказываете себе, что можете все! ⭐"
      ];
    } else if (progress < 0.6) {
      return [
        "Невероятно! Вы уже прошли почти половину пути! 🎯",
        "Потрясающе! Ваша дисциплина вдохновляет! 🌟",
        "Браво! Вы становитесь сильнее с каждым днем! 💎"
      ];
    } else if (progress < 0.8) {
      return [
        "Фантастика! Финишная прямая уже близко! 🏆",
        "Восхитительно! Ваша целеустремленность поражает! 🔥",
        "Великолепно! Вы почти у цели, не останавливайтесь! 🚀"
      ];
    } else {
      return [
        "НЕВЕРОЯТНО! Вы почти достигли совершенства! 🏆✨",
        "ПОТРЯСАЮЩЕ! Ваша сила духа безгранична! 💎🔥",
        "ФЕНОМЕНАЛЬНО! Вы - настоящий мастер самодисциплины! 👑⭐"
      ];
    }
  };

  useEffect(() => {
    if (isOpen) {
      const progress = currentDay / totalDays;
      const messages = getMotivationMessage(progress);
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setMotivationText(randomMessage);
    }
  }, [isOpen, currentDay, totalDays]);

  const handleComplete = () => {
    setShowCelebration(true);
    
    // Запускаем салют
    setTimeout(() => {
      onComplete();
      setShowCelebration(false);
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Затемнение экрана */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        
        {/* Анимация салюта */}
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-60">
            {/* Салют */}
            {Array.from({ length: 50 }, (_, i) => {
              const colors = [
                'bg-yellow-400', 'bg-orange-500', 'bg-pink-500', 
                'bg-purple-500', 'bg-red-500', 'bg-green-500',
                'bg-blue-500', 'bg-indigo-500', 'bg-cyan-400'
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
                  <div className={`w-4 h-4 rounded-full ${colors[i % colors.length]}`}></div>
                </div>
              );
            })}

            {/* Центральная анимация с мотивационным текстом */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center animate-bounce">
                <div className="text-8xl mb-6">🎉</div>
                <div className="text-white text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
                  Превосходно!
                </div>
                <div className="text-white/90 text-lg max-w-md mx-auto px-4">
                  {motivationText}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Основное меню (скрывается во время салюта) */}
        {!showCelebration && (
          <div className="relative backdrop-blur-xl bg-white/8 border border-white/20 rounded-2xl p-6 w-full max-w-sm overflow-hidden"
               style={{
                 boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 20px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                 backdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                 WebkitBackdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
               }}>
            
            {/* Стеклянный эффект */}
            <div 
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: `
                  linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%),
                  radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
                  radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)
                `,
              }}
            />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
            
            <div className="relative z-10 text-center">
              {/* Иконка */}
              <div className={`w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-r ${askezaColor}`}
                   style={{
                     boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)'
                   }}>
                <i className="ri-add-line text-white text-3xl"></i>
              </div>

              {/* Заголовок */}
              <h3 className="text-xl font-bold text-white mb-2">Подтвердить выполнение</h3>
              <p className="text-white/70 text-sm mb-2">{askezaTitle}</p>
              <p className="text-cyan-400 text-xs mb-6">
                День {currentDay + 1} из {totalDays} • {Math.round(((currentDay + 1) / totalDays) * 100)}%
              </p>

              {/* Мотивационный текст */}
              <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                <p className="text-white/90 text-sm leading-relaxed">
                  {motivationText}
                </p>
              </div>

              {/* Кнопки */}
              <div className="space-y-3">
                <button
                  onClick={handleComplete}
                  className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${askezaColor} text-white font-medium transition-all hover:scale-105`}
                  style={{
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)'
                  }}
                >
                  <i className="ri-check-line mr-2"></i>
                  Выполнено!
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                >
                  <i className="ri-close-line mr-2"></i>
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
