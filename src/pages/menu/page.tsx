
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/feature/BottomNavigation';
import GlassCard from '../../components/base/GlassCard';
import { getTelegramUserId } from '../../utils/database';

export default function MenuPage() {
  const navigate = useNavigate();
  const [showSyncModal, setShowSyncModal] = useState(false);
  
  const telegramId = getTelegramUserId();
  const isAdmin = telegramId === 212879920;

  const menuItems = [
    {
      id: 'askeza',
      title: 'Аскезы',
      description: 'Духовные практики и самодисциплина',
      icon: 'ri-heart-pulse-line',
      path: '/askeza',
      glowColor: 'rgba(251, 191, 36, 0.6)' // yellow
    },
    {
      id: 'emotions',
      title: 'Эмоции',
      description: 'Отслеживание настроения и чувств',
      icon: 'ri-emotion-line',
      path: '/emotions',
      glowColor: 'rgba(236, 72, 153, 0.6)' // pink
    },
    {
      id: 'journal',
      title: 'Дневник',
      description: 'Записи и размышления',
      icon: 'ri-book-line',
      path: '/journal',
      glowColor: 'rgba(139, 92, 246, 0.6)' // purple
    },
    {
      id: 'settings',
      title: 'Настройки',
      description: 'Персонализация приложения',
      icon: 'ri-settings-3-line',
      path: '/settings',
      glowColor: 'rgba(16, 185, 129, 0.6)' // emerald
    }
  ];

  const proFeatures = [
    {
      id: 'ai-coach',
      title: 'ИИ-коуч',
      description: 'Персональные рекомендации',
      icon: 'ri-robot-line',
      glowColor: 'rgba(251, 191, 36, 0.6)' // yellow
    },
    {
      id: 'advanced-analytics',
      title: 'Продвинутая аналитика',
      description: 'Глубокий анализ прогресса',
      icon: 'ri-line-chart-line',
      glowColor: 'rgba(251, 191, 36, 0.6)' // yellow
    }
  ];

  const handleSync = () => {
    setShowSyncModal(true);
    // Имитация синхронизации
    setTimeout(() => {
      setShowSyncModal(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 pb-28">
        {/* Хедер с логотипом */}
        <div className="pt-6 pb-4 px-4">
          <div className="text-center mb-4">
            <button
              onClick={() => {
                if (isAdmin) {
                  navigate('/admin');
                }
              }}
              className="text-center group"
            >
              <h1 
                className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2 group-hover:from-cyan-400 group-hover:via-purple-400 group-hover:to-pink-400 transition-all duration-500"
                style={{ 
                  fontFamily: 'Orbitron, monospace',
                  textShadow: '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(236, 72, 153, 0.3), 0 0 60px rgba(6, 182, 212, 0.2)',
                  animation: 'glow 2s ease-in-out infinite alternate'
                }}
              >
                COMPASS
              </h1>
            </button>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              Меню
            </h2>
            <p className="text-white/60 text-sm">Все функции приложения</p>
          </div>
        </div>

        {/* Основные функции */}
        <div className="px-4 mb-6">
          <h2 className="text-white text-lg font-semibold mb-4 flex items-center">
            <i className="ri-apps-line mr-2 text-purple-400"
               style={{
                 filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))'
               }}></i>
            Основные функции
          </h2>
          
          <div className="space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="group w-full"
              >
                <GlassCard className="p-4 hover:bg-white/10 transition-all duration-300 group-hover:scale-105">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 group-hover:bg-cyan-400/20 transition-all duration-300">
                      <i className={`${item.icon} text-cyan-400 text-2xl group-hover:text-cyan-300 transition-colors`}
                         style={{
                           filter: `drop-shadow(0 0 8px ${item.glowColor})`
                         }}></i>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-white font-medium text-base mb-1 group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {item.description}
                      </p>
                    </div>
                    <i className="ri-arrow-right-s-line text-white/40 group-hover:text-cyan-400 transition-colors"></i>
                  </div>
                </GlassCard>
              </button>
            ))}
          </div>
        </div>

        {/* PRO функции */}
        <div className="px-4 mb-6">
          <h2 className="text-white text-lg font-semibold mb-4 flex items-center">
            <i className="ri-vip-crown-line mr-2 text-yellow-400"
               style={{
                 filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))'
               }}></i>
            PRO функции
            <span className="ml-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white text-xs font-bold">PRO</span>
          </h2>
          
          <div className="space-y-3">
            {proFeatures.map((feature) => (
              <GlassCard key={feature.id} className="p-4 relative overflow-hidden">
                <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                  <span className="text-white text-xs font-bold">PRO</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10">
                    <i className={`${feature.icon} text-yellow-400 text-2xl`}
                       style={{
                         filter: `drop-shadow(0 0 8px ${feature.glowColor})`
                       }}></i>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-medium text-base mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {feature.description}
                    </p>
                  </div>
                  
                  <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white text-sm font-medium hover:shadow-lg transition-shadow">
                    Получить
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* SOS */}
        <div className="px-4 mb-6">
          <GlassCard className="p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/30">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10">
                <i className="ri-alarm-warning-line text-red-400 text-2xl animate-pulse"
                   style={{
                     filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))'
                   }}></i>
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium text-base mb-1">
                  SOS - Экстренная помощь
                </h3>
                <p className="text-white/70 text-sm">
                  Нужна поддержка? Мы здесь для вас
                </p>
              </div>
              
              <button className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm font-medium transition-colors">
                Помощь
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Синхронизация данных */}
        <div className="px-4 mb-6">
          <GlassCard className="p-4">
            <button
              onClick={handleSync}
              className="w-full flex items-center space-x-4 hover:bg-white/5 rounded-lg transition-colors p-2"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10">
                <i className="ri-refresh-line text-cyan-400 text-2xl"
                   style={{
                     filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))'
                   }}></i>
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-medium text-base mb-1">Синхронизация данных</h3>
                <p className="text-white/60 text-sm">Последняя: сегодня в 14:30</p>
              </div>
              <i className="ri-arrow-right-s-line text-white/60"></i>
            </button>
          </GlassCard>
        </div>

        {/* Информация о приложении */}
        <div className="px-4">
          <GlassCard className="p-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-white/10">
                <i className="ri-information-line text-purple-400 text-2xl"
                   style={{
                     filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))'
                   }}></i>
              </div>
              <h3 className="text-white font-medium text-base mb-1">COMPASS v1.0</h3>
              <p className="text-white/60 text-xs mb-3">
                Приложение для духовного развития и самопознания
              </p>
              <div className="flex justify-center space-x-4 text-xs text-white/50 mb-2">
                <span>© 2024 COMPASS</span>
                <span>•</span>
                <span>Сделано с ❤️</span>
              </div>
              <div className="text-xs text-white/40">
                Сборка #165
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Модальное окно синхронизации */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-sm p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-cyan-500/20">
                <i className="ri-refresh-line text-cyan-400 text-2xl animate-spin"></i>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">
                Синхронизация
              </h3>
              
              <p className="text-white/70 text-sm">
                Обновляем ваши данные...
              </p>
            </div>
          </GlassCard>
        </div>
      )}

      <BottomNavigation />

      <style>{`
        @keyframes glow {
          from {
            text-shadow: 0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(236, 72, 153, 0.3), 0 0 60px rgba(6, 182, 212, 0.2);
          }
          to {
            text-shadow: 0 0 30px rgba(6, 182, 212, 0.8), 0 0 50px rgba(168, 85, 247, 0.5), 0 0 70px rgba(236, 72, 153, 0.3);
          }
        }
      `}</style>
    </div>
  );
}
