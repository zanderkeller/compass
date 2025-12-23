
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dbManager, getTelegramUserId } from '../../utils/database';
import GlassCard from '../base/GlassCard';

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showMorningWarning, setShowMorningWarning] = useState(false);
  const [showEveningWarning, setShowEveningWarning] = useState(false);

  const navItems = [
    { icon: 'ri-home-line', label: 'Дом', path: '/', color: '#06b6d4' },
    { icon: 'ri-emotion-line', label: 'Эмоции', path: '/emotions', color: '#ec4899' },
    { icon: 'ri-add-line', label: 'Добавить', path: '', isCenter: true },
    { icon: 'ri-book-line', label: 'Журнал', path: '/journal', color: '#8b5cf6' },
    { icon: 'ri-menu-line', label: 'Меню', path: '/menu', color: '#10b981' }
  ];

  const handleCenterButtonClick = () => {
    setShowAddMenu(!showAddMenu);
  };

  const checkExistingEntry = async (type: 'morning' | 'evening') => {
    try {
      await dbManager.init();
      const today = new Date().toISOString().split('T')[0];
      const telegramId = getTelegramUserId();
      const existingEntry = await dbManager.getEmotionEntryByDate(telegramId, today, type);
      
      if (existingEntry) {
        if (type === 'morning') {
          setShowMorningWarning(true);
        } else {
          setShowEveningWarning(true);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Ошибка проверки записи:', error);
      return false;
    }
  };

  const handleAddAction = async (action: string) => {
    setShowAddMenu(false);
    
    if (action === 'morning') {
      const hasEntry = await checkExistingEntry('morning');
      if (!hasEntry) {
        navigate('/checkin/morning');
      }
    } else if (action === 'evening') {
      const hasEntry = await checkExistingEntry('evening');
      if (!hasEntry) {
        navigate('/checkin/evening');
      }
    } else if (action === 'entry') {
      navigate('/journal');
    } else if (action === 'meditation') {
      console.log('Медитация');
    } else if (action === 'gratitude') {
      console.log('Благодарность');
    }
  };

  const getItemStyle = (item: any) => {
    const isActive = location.pathname === item.path;
    
    if (isActive && item.color) {
      return {
        color: item.color,
        filter: `drop-shadow(0 0 12px ${item.color})`
      };
    }
    
    return {
      color: isActive ? '#06b6d4' : 'rgba(255, 255, 255, 0.6)',
      filter: isActive 
        ? 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.7))' 
        : 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))'
    };
  };

  const getTextShadow = (item: any) => {
    const isActive = location.pathname === item.path;
    
    if (isActive && item.color) {
      return `0 0 8px ${item.color}`;
    }
    
    return isActive 
      ? '0 0 8px #06b6d4' 
      : '0 0 4px rgba(255, 255, 255, 0.3)';
  };

  return (
    <>
      {/* Morning Warning Modal */}
      {showMorningWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="p-6 max-w-sm w-full" variant="elevated">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-yellow-500/20 border border-yellow-400/30">
                <i className="ri-alarm-warning-line text-3xl text-yellow-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Данные уже записаны</h3>
              <p className="text-white/70 mb-6">Вы уже делали утренний чек-ин сегодня. Хотите изменить данные?</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMorningWarning(false)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    setShowMorningWarning(false);
                    navigate('/checkin/morning');
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 border border-yellow-400 rounded-lg text-white hover:from-yellow-600 hover:to-orange-600 transition-all"
                >
                  Изменить
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Evening Warning Modal */}
      {showEveningWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="p-6 max-w-sm w-full" variant="elevated">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-purple-500/20 border border-purple-400/30">
                <i className="ri-alarm-warning-line text-3xl text-purple-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Данные уже записаны</h3>
              <p className="text-white/70 mb-6">Вы уже делали вечерний чек-аут сегодня. Хотите изменить данные?</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEveningWarning(false)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    setShowEveningWarning(false);
                    navigate('/checkin/evening');
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 border border-purple-400 rounded-lg text-white hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Изменить
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Overlay для закрытия меню */}
      {showAddMenu && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setShowAddMenu(false)}
        />
      )}

      {/* Стильное меню добавления записи */}
      {showAddMenu && (
        <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4">
          <div className="relative">
            {/* Светящийся фон */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/15 to-purple-500/15 rounded-3xl blur-2xl"></div>
            
            {/* Основное меню */}
            <div 
              className="relative rounded-3xl p-4 shadow-2xl border border-white/15"
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(30px) saturate(200%)',
                WebkitBackdropFilter: 'blur(30px) saturate(200%)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 40px rgba(6, 182, 212, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleAddAction('morning')}
                  className="group flex items-center space-x-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-400/10 to-yellow-500/10 border border-orange-300/20 hover:from-orange-400/20 hover:to-yellow-500/20 hover:border-orange-300/40 transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    boxShadow: '0 0 15px rgba(251, 146, 60, 0.1)',
                  }}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-yellow-500 shadow-lg group-hover:shadow-orange-500/50 transition-all duration-300 flex-shrink-0">
                    <i className="ri-sun-line text-white text-lg"></i>
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white font-semibold text-sm">Утренний чек-ин</div>
                    <div className="text-white/60 text-xs">Начни день правильно</div>
                  </div>
                  <i className="ri-arrow-right-line text-white/40 group-hover:text-white/80 transition-colors text-sm"></i>
                </button>

                <button
                  onClick={() => handleAddAction('evening')}
                  className="group flex items-center space-x-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    boxShadow: '0 0 15px rgba(168, 85, 247, 0.1)',
                  }}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 flex-shrink-0">
                    <i className="ri-moon-line text-white text-lg"></i>
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white font-semibold text-sm">Вечерний чек-аут</div>
                    <div className="text-white/60 text-xs">Подведи итоги дня</div>
                  </div>
                  <i className="ri-arrow-right-line text-white/40 group-hover:text-white/80 transition-colors text-sm"></i>
                </button>

                <button
                  onClick={() => handleAddAction('entry')}
                  className="group flex items-center space-x-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-400/10 to-blue-500/10 border border-cyan-300/20 hover:from-cyan-400/20 hover:to-blue-500/20 hover:border-cyan-300/40 transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    boxShadow: '0 0 15px rgba(34, 211, 238, 0.1)',
                  }}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg group-hover:shadow-cyan-500/50 transition-all duration-300 flex-shrink-0">
                    <i className="ri-edit-line text-white text-lg"></i>
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white font-semibold text-sm">Добавить запись</div>
                    <div className="text-white/60 text-xs">Запиши свои мысли</div>
                  </div>
                  <i className="ri-arrow-right-line text-white/40 group-hover:text-white/80 transition-colors text-sm"></i>
                </button>

                <button
                  onClick={() => handleAddAction('meditation')}
                  className="group flex items-center space-x-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-green-400/10 to-emerald-500/10 border border-green-300/20 hover:from-green-400/20 hover:to-emerald-500/20 hover:border-green-300/40 transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    boxShadow: '0 0 15px rgba(34, 197, 94, 0.1)',
                  }}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg group-hover:shadow-green-500/50 transition-all duration-300 flex-shrink-0">
                    <i className="ri-leaf-line text-white text-lg"></i>
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white font-semibold text-sm">Медитация</div>
                    <div className="text-white/60 text-xs">5 минут в день</div>
                  </div>
                  <i className="ri-arrow-right-line text-white/40 group-hover:text-white/80 transition-colors text-sm"></i>
                </button>

                <button
                  onClick={() => handleAddAction('gratitude')}
                  className="group flex items-center space-x-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-pink-400/10 to-rose-500/10 border border-pink-300/20 hover:from-pink-400/20 hover:to-rose-500/20 hover:border-pink-300/40 transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    boxShadow: '0 0 15px rgba(236, 72, 153, 0.1)',
                  }}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-400 to-rose-500 shadow-lg group-hover:shadow-pink-500/50 transition-all duration-300 flex-shrink-0">
                    <i className="ri-heart-pulse-line text-white text-lg"></i>
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white font-semibold text-sm">Благодарность</div>
                    <div className="text-white/60 text-xs">Запишите 3 вещи</div>
                  </div>
                  <i className="ri-arrow-right-line text-white/40 group-hover:text-white/80 transition-colors text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Нижняя навигация */}
      <div className="fixed bottom-4 left-4 right-4 z-30">
        <div className="relative">
          {/* Светящийся фон для навигации */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
          
          <div 
            className="relative rounded-3xl border border-white/15"
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(30px) saturate(200%)',
              WebkitBackdropFilter: 'blur(30px) saturate(200%)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 40px rgba(6, 182, 212, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="grid grid-cols-5 h-20">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.isCenter ? handleCenterButtonClick : () => navigate(item.path)}
                  className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 rounded-3xl hover:bg-white/5 ${
                    item.isCenter 
                      ? 'relative -top-4' 
                      : ''
                  }`}
                  style={!item.isCenter ? getItemStyle(item) : undefined}
                >
                  {item.isCenter ? (
                    <div className="relative">
                      {/* Анимированная стеклянная кнопка */}
                      <div 
                        className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300 overflow-hidden border border-white/20 group"
                        style={{
                          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                          backdropFilter: 'blur(25px) saturate(200%)',
                          WebkitBackdropFilter: 'blur(25px) saturate(200%)',
                          boxShadow: '0 12px 30px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                          animation: 'pulseButton 2s ease-in-out infinite',
                        }}
                      >
                        {/* Вращающаяся граница */}
                        <div className="absolute inset-0 rounded-full" style={{
                          background: 'conic-gradient(from 0deg, rgba(6, 182, 212, 0.5), rgba(59, 130, 246, 0.5), rgba(168, 85, 247, 0.5), rgba(6, 182, 212, 0.5))',
                          animation: 'rotateBorder 3s linear infinite',
                          opacity: showAddMenu ? 1 : 0.3,
                          transition: 'opacity 0.3s ease',
                        }}></div>
                        
                        {/* Внутренний фон */}
                        <div className="absolute inset-0.5 rounded-full" style={{
                          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                          backdropFilter: 'blur(25px)',
                          WebkitBackdropFilter: 'blur(25px)',
                        }}></div>
                        
                        {/* Внутренний светящийся эффект */}
                        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/10 to-transparent"></div>
                        
                        <i 
                          className={`${item.icon} text-white text-2xl transition-all duration-300 relative z-10 group-hover:text-cyan-300`}
                          style={{
                            transform: showAddMenu ? 'rotate(45deg)' : 'rotate(0deg)',
                          }}
                        ></i>
                      </div>
                    </div>
                  ) : (
                    <>
                      <i className={`${item.icon} text-lg`}></i>
                      <span 
                        className="text-xs font-medium"
                        style={{
                          textShadow: getTextShadow(item)
                        }}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulseButton {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        @keyframes rotateBorder {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}

