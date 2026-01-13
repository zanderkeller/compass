import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dbManager, getTelegramUserId } from '../../utils/database';

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showMorningWarning, setShowMorningWarning] = useState(false);
  const [showEveningWarning, setShowEveningWarning] = useState(false);

  const navItems = [
    { icon: 'ri-home-line', label: 'Дом', path: '/', color: '#06b6d4' },
    { icon: 'ri-emotion-line', label: 'Эмоции', path: '/emotions', color: '#ec4899' },
    { icon: 'ri-add-line', label: '', path: '', isCenter: true },
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
    } else if (action === 'askeza') {
      navigate('/askeza?create=true');
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
          <div 
            className="p-6 max-w-sm w-full rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.4), 0 0 40px rgba(251,191,36,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.3) 0%, rgba(245,158,11,0.2) 100%)',
                  boxShadow: '0 0 30px rgba(251,191,36,0.3)',
                }}
              >
                <i className="ri-alarm-warning-line text-3xl text-yellow-400" style={{ filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.5))' }} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Данные уже записаны</h3>
              <p className="text-white/70 mb-6">Вы уже делали утренний чек-ин сегодня. Хотите изменить данные?</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMorningWarning(false)}
                  className="flex-1 px-4 py-3 rounded-xl text-white/70 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    setShowMorningWarning(false);
                    navigate('/checkin/morning');
                  }}
                  className="flex-1 px-4 py-3 rounded-xl text-white font-medium"
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    boxShadow: '0 0 20px rgba(251,191,36,0.4)',
                  }}
                >
                  Изменить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evening Warning Modal */}
      {showEveningWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="p-6 max-w-sm w-full rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.4), 0 0 40px rgba(168,85,247,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(236,72,153,0.2) 100%)',
                  boxShadow: '0 0 30px rgba(168,85,247,0.3)',
                }}
              >
                <i className="ri-alarm-warning-line text-3xl text-purple-400" style={{ filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.5))' }} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Данные уже записаны</h3>
              <p className="text-white/70 mb-6">Вы уже делали вечерний чек-аут сегодня. Хотите изменить данные?</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEveningWarning(false)}
                  className="flex-1 px-4 py-3 rounded-xl text-white/70 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    setShowEveningWarning(false);
                    navigate('/checkin/evening');
                  }}
                  className="flex-1 px-4 py-3 rounded-xl text-white font-medium"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                    boxShadow: '0 0 20px rgba(168,85,247,0.4)',
                  }}
                >
                  Изменить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay для закрытия меню */}
      {showAddMenu && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-40"
          onClick={() => setShowAddMenu(false)}
        />
      )}

      {/* Меню добавления с жидким стеклом */}
      {showAddMenu && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4">
          <div className="relative">
            {/* Неоновое свечение */}
            <div 
              className="absolute inset-0 rounded-3xl blur-2xl"
              style={{
                background: 'radial-gradient(circle at center, rgba(6,182,212,0.3) 0%, rgba(139,92,246,0.2) 50%, transparent 70%)',
              }}
            />

            {/* Основное меню */}
            <div
              className="relative rounded-3xl p-4 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(40px) saturate(200%)',
                WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.4), 0 0 60px rgba(6,182,212,0.2), inset 0 1px 0 rgba(255,255,255,0.25)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {/* Жидкие эффекты */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div 
                  className="absolute -top-20 -left-20 w-40 h-40 rounded-full opacity-40"
                  style={{
                    background: 'radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%)',
                    animation: 'liquid-float 6s ease-in-out infinite',
                  }}
                />
                <div 
                  className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full opacity-30"
                  style={{
                    background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)',
                    animation: 'liquid-float 8s ease-in-out infinite reverse',
                  }}
                />
              </div>
              
              {/* Блик сверху */}
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              <div className="relative z-10 flex flex-col space-y-2">
                {/* Утренний чек-ин */}
                <button
                  onClick={() => handleAddAction('morning')}
                  className="group flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.1) 100%)',
                    border: '1px solid rgba(251,191,36,0.2)',
                  }}
                >
                  <div 
                    className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      boxShadow: '0 0 20px rgba(251,191,36,0.4)',
                    }}
                  >
                    <i className="ri-sun-line text-white text-lg" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white font-medium text-sm">Утренний чек-ин</div>
                    <div className="text-white/50 text-xs">Начни день правильно</div>
                  </div>
                  <i className="ri-arrow-right-s-line text-white/30 group-hover:text-white/60 text-xl transition-colors" />
                </button>

                {/* Вечерний чек-аут */}
                <button
                  onClick={() => handleAddAction('evening')}
                  className="group flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.1) 100%)',
                    border: '1px solid rgba(168,85,247,0.2)',
                  }}
                >
                  <div 
                    className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                      boxShadow: '0 0 20px rgba(168,85,247,0.4)',
                    }}
                  >
                    <i className="ri-moon-line text-white text-lg" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white font-medium text-sm">Вечерний чек-аут</div>
                    <div className="text-white/50 text-xs">Подведи итоги дня</div>
                  </div>
                  <i className="ri-arrow-right-s-line text-white/30 group-hover:text-white/60 text-xl transition-colors" />
                </button>

                {/* Новая аскеза */}
                <button
                  onClick={() => handleAddAction('askeza')}
                  className="group flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.1) 100%)',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}
                >
                  <div 
                    className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                      boxShadow: '0 0 20px rgba(16,185,129,0.4)',
                    }}
                  >
                    <i className="ri-fire-line text-white text-lg" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white font-medium text-sm">Новая аскеза</div>
                    <div className="text-white/50 text-xs">Создай духовную практику</div>
                  </div>
                  <i className="ri-arrow-right-s-line text-white/30 group-hover:text-white/60 text-xl transition-colors" />
                </button>

                {/* Добавить запись */}
                <button
                  onClick={() => handleAddAction('entry')}
                  className="group flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(59,130,246,0.1) 100%)',
                    border: '1px solid rgba(6,182,212,0.2)',
                  }}
                >
                  <div 
                    className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                      boxShadow: '0 0 20px rgba(6,182,212,0.4)',
                    }}
                  >
                    <i className="ri-edit-line text-white text-lg" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white font-medium text-sm">Добавить запись</div>
                    <div className="text-white/50 text-xs">Запиши свои мысли</div>
                  </div>
                  <i className="ri-arrow-right-s-line text-white/30 group-hover:text-white/60 text-xl transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Нижняя навигация - компактная */}
      <div className="fixed bottom-3 left-3 right-3 z-30">
        <div className="relative">
          {/* Неоновое свечение под навигацией */}
          <div 
            className="absolute inset-0 rounded-2xl blur-lg"
            style={{
              background: 'linear-gradient(90deg, rgba(6,182,212,0.15) 0%, rgba(139,92,246,0.15) 50%, rgba(16,185,129,0.15) 100%)',
            }}
          />

          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              boxShadow: '0 15px 40px rgba(0,0,0,0.4), 0 0 30px rgba(6,182,212,0.1), inset 0 1px 0 rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* Жидкие эффекты */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div 
                className="absolute -top-8 left-1/4 w-16 h-16 rounded-full opacity-25"
                style={{
                  background: 'radial-gradient(circle, rgba(6,182,212,0.6) 0%, transparent 70%)',
                  animation: 'liquid-nav 4s ease-in-out infinite',
                }}
              />
              <div 
                className="absolute -bottom-8 right-1/4 w-16 h-16 rounded-full opacity-15"
                style={{
                  background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)',
                  animation: 'liquid-nav 5s ease-in-out infinite reverse',
                }}
              />
            </div>
            
            {/* Блик сверху */}
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            <div className="relative z-10 grid grid-cols-5 h-14 items-center">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.isCenter ? handleCenterButtonClick : () => navigate(item.path)}
                  className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${
                    item.isCenter ? 'relative' : ''
                  }`}
                  style={!item.isCenter ? getItemStyle(item) : undefined}
                >
                  {item.isCenter ? (
                    <div className="relative flex items-center justify-center" style={{ marginTop: '-18px' }}>
                      {/* Внешнее свечение */}
                      <div 
                        className="absolute rounded-full blur-lg opacity-50"
                        style={{
                          width: '48px',
                          height: '48px',
                          background: 'linear-gradient(135deg, rgba(6,182,212,0.7) 0%, rgba(139,92,246,0.7) 100%)',
                          animation: 'pulse-glow 2s ease-in-out infinite',
                        }}
                      />
                      
                      {/* Вращающийся градиент */}
                      <div 
                        className="absolute rounded-full overflow-hidden"
                        style={{
                          width: '42px',
                          height: '42px',
                          background: 'conic-gradient(from 0deg, #06b6d4, #8b5cf6, #ec4899, #10b981, #06b6d4)',
                          animation: 'spin-slow 4s linear infinite',
                        }}
                      />
                      
                      {/* Основная кнопка */}
                      <div
                        className="relative w-10 h-10 rounded-full flex items-center justify-center transform hover:scale-110 transition-all duration-300 overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 15px rgba(0,0,0,0.4)',
                        }}
                      >
                        {/* Внутренний блик */}
                        <div 
                          className="absolute inset-0 rounded-full bg-gradient-to-b from-white/15 to-transparent" 
                          style={{ height: '50%' }} 
                        />
                        
                        <i
                          className="ri-add-line text-white text-lg relative z-10 transition-transform duration-300"
                          style={{
                            transform: showAddMenu ? 'rotate(45deg)' : 'rotate(0deg)',
                            filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5))',
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <i className={`${item.icon} text-lg`} />
                      <span
                        className="text-[9px] font-medium"
                        style={{ textShadow: getTextShadow(item) }}
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

      {/* CSS анимации */}
      <style>{`
        @keyframes liquid-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 20px) scale(1.1); }
        }
        
        @keyframes liquid-nav {
          0%, 100% { transform: translateX(0) scale(1); opacity: 0.3; }
          50% { transform: translateX(30px) scale(1.2); opacity: 0.5; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1.3); }
          50% { opacity: 0.9; transform: scale(1.5); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}