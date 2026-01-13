
import { useState } from 'react';
import { dbManager } from '../../utils/database';
import CelebrationModal from './CelebrationModal';

interface AskezaCardProps {
  askeza: {
    id: number;
    title: string;
    icon: string;
    color: string;
    duration: number;
    currentDay: number;
    isActive: boolean;
    showOnHome: boolean;
    completedToday?: boolean;
  };
  onUpdate: () => void;
}

export default function AskezaCard({ askeza, onUpdate }: AskezaCardProps) {
  const [showCelebration, setShowCelebration] = useState(false);

  // Проверка выполнения аскезы сегодня
  const checkTodayCompletion = (): boolean => {
    const today = new Date().toDateString();
    const lastCompleted = localStorage.getItem(`askeza_${askeza.id}_last_completed`);
    return lastCompleted === today;
  };

  const handleCompleteAskeza = async () => {
    if (!askeza.isActive || askeza.currentDay >= askeza.duration || checkTodayCompletion()) {
      return;
    }

    try {
      const newCurrentDay = askeza.currentDay + 1;
      await dbManager.updateAskezaEntry(askeza.id, { current_day: newCurrentDay });
      
      // Отмечаем выполнение сегодня
      const today = new Date().toDateString();
      localStorage.setItem(`askeza_${askeza.id}_last_completed`, today);
      
      // Показываем анимацию салюта
      setShowCelebration(true);
      
      // Обновляем данные
      onUpdate();
    } catch (error) {
      console.error('Ошибка выполнения аскезы:', error);
    }
  };

  const progress = (askeza.currentDay / askeza.duration) * 100;
  const isCompleted = askeza.currentDay >= askeza.duration;
  const completedToday = checkTodayCompletion();

  return (
    <>
      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r ${askeza.color}`}
            style={{
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)'
            }}>
              <i className={`${askeza.icon} text-white text-xl`}></i>
            </div>
            <div className="flex-1">
              <h3 className="text-white text-base font-semibold">{askeza.title}</h3>
              <p className="text-white/70 text-sm">
                День {askeza.currentDay} из {askeza.duration}
              </p>
              {completedToday && (
                <p className="text-green-400 text-xs mt-1">✓ Выполнено сегодня</p>
              )}
            </div>
          </div>
          
          {/* Кнопка выполнения */}
          <button
            onClick={handleCompleteAskeza}
            disabled={!askeza.isActive || completedToday || isCompleted}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group ${
              !askeza.isActive
                ? 'bg-gray-500/30 cursor-not-allowed'
                : completedToday 
                ? 'bg-green-500/50 cursor-not-allowed' 
                : isCompleted
                ? 'bg-gray-500/50 cursor-not-allowed'
                : `bg-gradient-to-r ${askeza.color} hover:scale-110`
            }`}
            style={askeza.isActive && !completedToday && !isCompleted ? {
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)'
            } : undefined}
          >
            <i className={`text-white text-xl transition-transform duration-300 ${
              !askeza.isActive
                ? 'ri-lock-line'
                : completedToday 
                ? 'ri-check-line' 
                : isCompleted
                ? 'ri-trophy-line'
                : 'ri-add-line group-hover:rotate-90'
            }`}></i>
            {askeza.isActive && !completedToday && !isCompleted && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            )}
          </button>
        </div>

        {/* Прогресс-бар */}
        <div className="mb-2">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${askeza.color} rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-white/60 text-xs">0%</span>
            <span className="text-cyan-400 text-xs font-semibold">{Math.round(progress)}%</span>
            <span className="text-white/60 text-xs">100%</span>
          </div>
        </div>
      </div>

      {/* Модальное окно празднования */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        title="Отлично!"
        message={`Вы выполнили аскезу "${askeza.title}" на ${askeza.currentDay} день!`}
      />
    </>
  );
}
