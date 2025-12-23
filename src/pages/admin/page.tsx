import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/base/GlassCard';
import BottomNavigation from '../../components/feature/BottomNavigation';
import { dbManager, getTelegramUserId } from '../../utils/database';

const backgroundModes = [
  {
    id: 'auto',
    title: 'Автоматический',
    description: 'Меняется в зависимости от времени суток',
    icon: 'ri-time-line',
    preview: 'linear-gradient(45deg, #FFB347 0%, #87CEEB 25%, #8B4A9C 50%, #000428 75%, #FFB347 100%)'
  },
  {
    id: 'morning',
    title: 'Утро',
    description: 'Теплые оранжево-золотые тона (6:00-12:00)',
    icon: 'ri-sun-line',
    preview: 'linear-gradient(to bottom, #FFB347 0%, #FFCC5C 20%, #87CEEB 40%, #98D8E8 60%, #F0E68C 80%, #FFA07A 100%)'
  },
  {
    id: 'day',
    title: 'День',
    description: 'Яркие сине-голубые тона (12:00-18:00)',
    icon: 'ri-sun-fill',
    preview: 'linear-gradient(to bottom, #87CEEB 0%, #98D8E8 20%, #B0E0E6 40%, #E0F6FF 60%, #F0F8FF 80%, #FFFFFF 100%)'
  },
  {
    id: 'evening',
    title: 'Вечер',
    description: 'Фиолетово-розовые тона (18:00-22:00)',
    icon: 'ri-moon-line',
    preview: 'linear-gradient(to bottom, #2D1B69 0%, #4A2C85 10%, #663399 20%, #8B4A9C 30%, #B565A7 40%, #D4A5A5 50%, #E6C2A6 60%, #F4D4A7 70%, #FFC1A0 80%, #FE9C7F 90%, #FF8C69 100%)'
  },
  {
    id: 'night',
    title: 'Ночь',
    description: 'Темно-фиолетовые с мерцающими звездами (22:00-6:00)',
    icon: 'ri-moon-fill',
    preview: 'linear-gradient(to bottom, #000428 0%, #004e92 100%)'
  }
];

export default function AdminPage() {
  const navigate = useNavigate();
  const [backgroundMode, setBackgroundMode] = useState<string>('auto');
  const [loading, setLoading] = useState(true);
  const [dbInfo, setDbInfo] = useState<any>(null);
  
  const telegramId = getTelegramUserId();
  const isAdmin = telegramId === 212879920;

  useEffect(() => {
    // Проверяем права доступа
    if (!isAdmin) {
      navigate('/');
      return;
    }

    loadAdminData();
  }, [isAdmin, navigate]);

  const loadAdminData = async () => {
    try {
      await dbManager.init();
      
      // Загружаем настройки фона
      const clientProfile = await dbManager.getClientProfileByTelegramId(telegramId);
      if (clientProfile && clientProfile.settings) {
        try {
          const settings = JSON.parse(clientProfile.settings);
          setBackgroundMode(settings.backgroundMode || 'auto');
        } catch (e) {
          setBackgroundMode('auto');
        }
      }

      // Загружаем информацию о базе данных
      const info = await dbManager.getDatabaseInfo();
      setDbInfo(info);
    } catch (error) {
      console.error('Ошибка загрузки данных админки:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackgroundModeChange = async (mode: string) => {
    setBackgroundMode(mode);
    
    try {
      await dbManager.init();
      
      // Проверяем, существует ли профиль
      let clientProfile = await dbManager.getClientProfileByTelegramId(telegramId);
      
      const settings = {
        backgroundMode: mode
      };

      if (!clientProfile) {
        // Создаем новый профиль, если его нет
        const newProfile = {
          telegram_id: telegramId,
          selected_widgets: ['askeza', 'emotion-chart'],
          widget_order: ['askeza', 'emotion-chart'],
          is_pro: true,
          energy: 850,
          completed_askezas: 0,
          settings: JSON.stringify(settings),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await dbManager.createClientProfile(newProfile);
      } else {
        // Обновляем существующий профиль
        await dbManager.updateClientProfile(telegramId, {
          settings: JSON.stringify(settings),
          updated_at: new Date().toISOString()
        });
      }
      
      // Уведомляем другие компоненты об изменении
      window.dispatchEvent(new CustomEvent('backgroundModeChanged', { detail: mode }));
      
      console.log('Настройки фона сохранены:', mode);
    } catch (error) {
      console.error('Ошибка сохранения настроек фона:', error);
    }
  };

  const clearAllData = async () => {
    if (confirm('Вы уверены, что хотите очистить все данные? Это действие необратимо!')) {
      try {
        await dbManager.clearAllData();
        alert('Все данные успешно очищены');
        await loadAdminData(); // Перезагружаем информацию
      } catch (error) {
        console.error('Ошибка очистки данных:', error);
        alert('Ошибка при очистке данных');
      }
    }
  };

  const exportData = async () => {
    try {
      const blob = await dbManager.exportData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compass_backup_${new Date().toISOString().split('T')[0]}.db`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка экспорта данных:', error);
      alert('Ошибка при экспорте данных');
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Загрузка админ-панели...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 pb-28">
        {/* Хедер */}
        <div className="pt-6 pb-4 px-4">
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500"
            style={{
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)'
            }}>
              <i className="ri-admin-line text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent mb-2">
              Админ-панель
            </h1>
            <p className="text-white/60 text-sm">Управление системой и настройками</p>
          </div>
        </div>

        {/* Статистика базы данных */}
        {dbInfo && (
          <div className="px-4 mb-6">
            <GlassCard className="p-4">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                <i className="ri-database-2-line mr-2 text-red-400"></i>
                Статистика базы данных
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-cyan-400 text-xl font-bold">{dbInfo.userCount}</div>
                  <div className="text-white/60 text-xs">Пользователи</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-purple-400 text-xl font-bold">{dbInfo.emotionCount}</div>
                  <div className="text-white/60 text-xs">Эмоции</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-green-400 text-xl font-bold">{dbInfo.journalCount}</div>
                  <div className="text-white/60 text-xs">Записи</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-yellow-400 text-xl font-bold">{dbInfo.askezaCount}</div>
                  <div className="text-white/60 text-xs">Аскезы</div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Настройки фона */}
        <div className="px-4 mb-6">
          <GlassCard className="p-4">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
              <i className="ri-palette-line mr-2 text-red-400"></i>
              Настройки фона
            </h3>
            
            <div className="space-y-3">
              {backgroundModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleBackgroundModeChange(mode.id)}
                  className={`w-full p-4 rounded-xl border transition-all duration-300 ${
                    backgroundMode === mode.id
                      ? 'border-red-400 bg-red-400/10'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Превью фона */}
                    <div 
                      className="w-16 h-16 rounded-xl border border-white/20 flex-shrink-0"
                      style={{ background: mode.preview }}
                    ></div>
                    
                    {/* Иконка режима */}
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${
                      backgroundMode === mode.id ? 'bg-red-400' : 'bg-white/20'
                    }`}>
                      <i className={`${mode.icon} text-white text-xl`}></i>
                    </div>

                    {/* Информация о режиме */}
                    <div className="flex-1 text-left">
                      <h4 className="text-white font-medium text-base mb-1">
                        {mode.title}
                      </h4>
                      <p className="text-white/60 text-sm">
                        {mode.description}
                      </p>
                    </div>

                    {/* Индикатор выбора */}
                    {backgroundMode === mode.id && (
                      <div className="w-6 h-6 rounded-full bg-red-400 flex items-center justify-center">
                        <i className="ri-check-line text-white text-sm"></i>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Управление данными */}
        <div className="px-4">
          <GlassCard className="p-4">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
              <i className="ri-database-line mr-2 text-red-400"></i>
              Управление данными
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={exportData}
                className="w-full p-3 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="ri-download-line text-green-400"></i>
                    <span className="text-white">Экспорт базы данных</span>
                  </div>
                  <i className="ri-arrow-right-s-line text-white/60"></i>
                </div>
              </button>
              
              <button
                onClick={clearAllData}
                className="w-full p-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="ri-delete-bin-line text-red-400"></i>
                    <span className="text-white">Очистить все данные</span>
                  </div>
                  <i className="ri-arrow-right-s-line text-white/60"></i>
                </div>
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}