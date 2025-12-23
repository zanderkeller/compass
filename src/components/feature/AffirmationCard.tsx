
import { useState } from 'react';
import GlassCard from '../base/GlassCard';
import { getTelegramUserData } from '../../utils/database';

export default function AffirmationCard() {
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  
  const affirmations = [
    "Я достоин любви и счастья",
    "Каждый день я становлюсь лучше",
    "Я принимаю себя таким, какой я есть",
    "Мои возможности безграничны",
    "Я создаю свою реальность",
    "Я благодарен за каждый новый день",
    "Я излучаю позитивную энергию",
    "Я верю в свои силы"
  ];

  const handleRefresh = () => {
    setCurrentAffirmation((prev) => (prev + 1) % affirmations.length);
  };

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Доброе утро' : currentHour < 18 ? 'Добрый день' : 'Добрый вечер';
  const userName = getTelegramUserData().first_name || 'Друг';
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('ru-RU', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long' 
  });

  // Моковые данные для демонстрации
  const completedAskezas = 12;
  const energy = 850;
  const isPro = true;

  // Определяем цвет иконки в зависимости от количества завершенных аскез
  const getAchievementColor = (count: number) => {
    if (count >= 50) return 'text-yellow-400'; // Золото
    if (count >= 25) return 'text-purple-400'; // Фиолетовый
    if (count >= 10) return 'text-blue-400';   // Синий
    if (count >= 5) return 'text-green-400';   // Зеленый
    return 'text-gray-400';                    // Серый
  };

  const getAchievementIcon = (count: number) => {
    if (count >= 50) return 'ri-trophy-line';
    if (count >= 25) return 'ri-medal-line';
    if (count >= 10) return 'ri-award-line';
    if (count >= 5) return 'ri-star-line';
    return 'ri-seedling-line';
  };

  return (
    <GlassCard className="p-5">
      {/* Приветствие и основная информация */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-white text-xl font-bold">
              {greeting}, {userName}! 👋
            </h2>
            <p className="text-white/60 text-sm">{formattedDate}</p>
          </div>
          
          {/* Статус PRO */}
          {isPro && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 rounded-full">
              <span className="text-black text-xs font-bold">PRO</span>
            </div>
          )}
        </div>

        {/* Статистика */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-4">
            {/* Завершенные аскезы */}
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-white/10 ${getAchievementColor(completedAskezas)}`}>
                <i className={`${getAchievementIcon(completedAskezas)} text-sm`}></i>
              </div>
              <div>
                <div className="text-white text-sm font-semibold">{completedAskezas}</div>
                <div className="text-white/50 text-xs">завершено</div>
              </div>
            </div>

            {/* Энергия */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-400/20">
                <i className="ri-flashlight-fill text-cyan-400 text-sm"></i>
              </div>
              <div>
                <div className="text-white text-sm font-semibold">{energy}</div>
                <div className="text-white/50 text-xs">энергии</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Аффирмация дня */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white/80 text-sm font-medium">Аффирмация дня</h3>
          <button 
            onClick={handleRefresh}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-cyan-400 hover:text-cyan-300"
          >
            <i className="ri-refresh-line text-xs"></i>
          </button>
        </div>
        
        <div className="relative">
          <div className="absolute -left-1 -top-1 text-cyan-400/30 text-2xl">"</div>
          <p className="text-white/90 text-sm leading-relaxed pl-3 pr-3">
            {affirmations[currentAffirmation]}
          </p>
          <div className="absolute -right-1 -bottom-1 text-cyan-400/30 text-2xl rotate-180">"</div>
        </div>
      </div>
    </GlassCard>
  );
}
