
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/feature/BottomNavigation';
import EmotionChart from '../../components/feature/EmotionChart';
import AskezaCompletionMenu from '../../components/feature/AskezaCompletionMenu';
import DynamicBackground from '../../components/feature/DynamicBackground';
import WidgetMenu from '../../components/feature/WidgetMenu';
import MeditationModal from '../../components/feature/MeditationModal';
import { dbManager, getTelegramUserId, getTelegramUserData, type UserProfile } from '../../utils/database';
import NeonButton from '../../components/base/NeonButton';

interface MoonPhase {
  phase: string;
  illumination: number;
  nextFullMoon: string;
  emoji: string;
  image: string;

  isWaxing: boolean;
  quarterBadge?: string;
}

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
}

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
const [askezas, setAskezas] = useState<AskezaItem[]>([]);
  const [moonPhase, setMoonPhase] = useState<MoonPhase | null>(null);
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);
  const [showCompletionMenu, setShowCompletionMenu] = useState<number | null>(null);
  const [showMeditationModal, setShowMeditationModal] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<string[]>([]);
  const [completedAskezas, setCompletedAskezas] = useState(0);
  const [energy, setEnergy] = useState(850);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadHomeData();
    calculateMoonPhase();
  }, [navigate]);

  // Загрузка активных виджетов из профиля пользователя
  useEffect(() => {
    const loadActiveWidgets = async () => {
      try {
        await dbManager.init();
        const telegramId = getTelegramUserId();
        const clientProfile = await dbManager.getClientProfileByTelegramId(telegramId);
        
        if (clientProfile) {
          console.log('Загружен профиль клиента:', clientProfile);
          
          const widgets = Array.isArray(clientProfile.selected_widgets) 
            ? clientProfile.selected_widgets 
            : (typeof clientProfile.selected_widgets === 'string' 
                ? JSON.parse(clientProfile.selected_widgets || '[]') 
                : []);
          
          const order = Array.isArray(clientProfile.widget_order) 
            ? clientProfile.widget_order 
            : (typeof clientProfile.widget_order === 'string' 
                ? JSON.parse(clientProfile.widget_order || '[]') 
                : widgets);

          console.log('Активные виджеты:', widgets);
          console.log('Порядок виджетов:', order);

          const lsOrder = JSON.parse(localStorage.getItem('widget_order') || '[]');
          setActiveWidgets(lsOrder.length ? lsOrder : (order.length > 0 ? order : widgets));
          setCompletedAskezas(clientProfile.completed_askezas || 0);
          setEnergy(clientProfile.energy || 850);
        } else {
          console.log('Профиль клиента не найден, создаем новый');
          // Создаем профиль с виджетами по умолчанию для новых пользователей
          const defaultWidgets = ['askeza', 'emotion-chart'];
          setActiveWidgets(defaultWidgets);
          
          const newProfile = {
            telegram_id: telegramId,
            selected_widgets: defaultWidgets,
            widget_order: defaultWidgets,
            is_pro: false,
            energy: 850,
            completed_askezas: 0,
            settings: '{}',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          await dbManager.createClientProfile(newProfile);
          console.log('Создан новый профиль клиента');
        }
      } catch (error) {
        console.error('Ошибка загрузки виджетов:', error);
        const defaultWidgets = ['askeza', 'emotion-chart'];
        setActiveWidgets(defaultWidgets);
      }
    };

    loadActiveWidgets();

    const handleWidgetsUpdate = (event: CustomEvent) => {
      console.log('Получено обновление виджетов:', event.detail);
      const { widgets, order } = event.detail;
      const lsOrder = JSON.parse(localStorage.getItem('widget_order') || '[]');
          setActiveWidgets(lsOrder.length ? lsOrder : (order.length > 0 ? order : widgets));
      // Перезагружаем аскезы после обновления виджетов
      loadAskezas();
    };

    window.addEventListener('widgetsUpdated', handleWidgetsUpdate as EventListener);

    return () => {
      window.removeEventListener('widgetsUpdated', handleWidgetsUpdate as EventListener);
    };
  }, []);

  const loadAskezas = async () => {
    try {
      await dbManager.init();
      const telegramId = getTelegramUserId();
      
      // Получаем ВСЕ аскезы пользователя
      const dbAskezas = await dbManager.getAskezaEntriesByTelegramId(telegramId);
      console.log('Загружено аскез из базы:', dbAskezas.length);
      
      // Фильтруем только те, которые должны показываться на главной
      const formattedAskezas: AskezaItem[] = dbAskezas
        .filter(askeza => {
          console.log(`Аскеза "${askeza.title}": show_on_home=${askeza.show_on_home}, is_active=${askeza.is_active}`);
          // Проверяем различные типы данных для show_on_home
          const showOnHome = askeza.show_on_home;
          // Используем строгую проверку типов для избежания ошибок TypeScript
          return showOnHome === true || 
                 (typeof showOnHome === 'number' && showOnHome === 1) || 
                 (typeof showOnHome === 'string' && (showOnHome === '1' || showOnHome === 'true'));
        })
        .map(askeza => ({
          id: askeza.id!,
          title: askeza.title,
          icon: askeza.icon,
          color: askeza.color,
          duration: askeza.duration,
          currentDay: askeza.current_day,
          isActive: askeza.is_active,
          showOnHome: askeza.show_on_home
        }));

      console.log('Аскезы для отображения на главной:', formattedAskezas.length);
      setAskezas(formattedAskezas);
    } catch (error) {
      console.error('Ошибка загрузки аскез:', error);
    }
  };

  const calculateMoonPhase = () => {
    const now = new Date();
    const knownNewMoon = new Date('2000-01-06T18:14:00Z');
    const lunarCycle = 29.53058867;
    const daysSinceKnownNewMoon = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const currentCyclePosition = daysSinceKnownNewMoon % lunarCycle;
    const isWaxing = currentCyclePosition <= (lunarCycle / 2);
let phase: string;
    let emoji: string;
    let image: string;
    
    if (currentCyclePosition < 1) {
      phase = 'Новолуние';
      emoji = '🌑';
      image = 'https://readdy.ai/api/search-image?query=3D%20rendered%20new%20moon%2C%20dark%20lunar%20sphere%20without%20circle%20frame%2C%20realistic%20space%20moon%2C%20night%20sky%2C%20astronomical%203D%20illustration%2C%20dark%20moon%20surface%2C%20cinematic%20lighting%2C%20high%20detail%203D%20model%2C%20no%20background%20circle&width=80&height=80&seq=3dnewmoon2&orientation=squarish';
    } else if (currentCyclePosition < 7.4) {
      phase = 'Растущая луна';
      emoji = '🌒';
      image = 'https://readdy.ai/api/search-image?query=3D%20rendered%20waxing%20crescent%20moon%20without%20circle%20frame%2C%20growing%20lunar%20phase%2C%20realistic%203D%20moon%20model%2C%20cinematic%20space%20lighting%2C%20detailed%20lunar%20surface%2C%20night%20sky%2C%20astronomical%203D%20illustration%2C%20no%20background%20circle&width=80&height=80&seq=3dwaxing2&orientation=squarish';
    } else if (currentCyclePosition < 8.4) {
      phase = 'Первая четверть';
      emoji = '🌓';
      image = 'https://readdy.ai/api/search-image?query=3D%20rendered%20first%20quarter%20moon%20without%20circle%20frame%2C%20half%20moon%20phase%2C%20realistic%20lunar%203D%20model%2C%20detailed%20moon%20surface%2C%20cinematic%20lighting%2C%20space%20illustration%2C%20astronomical%203D%20rendering%2C%20no%20background%20circle&width=80&height=80&seq=3dfirstquarter2&orientation=squarish';
    } else if (currentCyclePosition < 14.8) {
      phase = 'Растущая луна';
      emoji = '🌔';
      image = 'https://readdy.ai/api/search-image?query=3D%20rendered%20waxing%20gibbous%20moon%20without%20circle%20frame%2C%20almost%20full%20lunar%20phase%2C%20realistic%203D%20moon%20model%2C%20detailed%20surface%2C%20cinematic%20space%20lighting%2C%20astronomical%203D%20illustration%2C%20no%20background%20circle&width=80&height=80&seq=3dwaxinggibbous2&orientation=squarish';
    } else if (currentCyclePosition < 15.8) {
      phase = 'Полнолуние';
      emoji = '🌕';
      image = 'https://readdy.ai/api/search-image?query=3D%20rendered%20full%20moon%20without%20circle%20frame%2C%20bright%20complete%20lunar%20phase%2C%20realistic%203D%20moon%20model%2C%20detailed%20lunar%20surface%2C%20cinematic%20lighting%2C%20space%20illustration%2C%20high%20quality%203D%20rendering%2C%20no%20background%20circle&width=80&height=80&seq=3dfullmoon2&orientation=squarish';
    } else if (currentCyclePosition < 22.1) {
      phase = 'Убывающая луна';
      emoji = '🌖';
      image = 'https://readdy.ai/api/search-image?query=3D%20rendered%20waning%20gibbous%20moon%20without%20circle%20frame%2C%20decreasing%20lunar%20phase%2C%20realistic%203D%20moon%20model%2C%20detailed%20surface%2C%20cinematic%20space%20lighting%2C%20astronomical%203D%20illustration%2C%20no%20background%20circle&width=80&height=80&seq=3dwaninggibbous2&orientation=squarish';
    } else if (currentCyclePosition < 23.1) {
      phase = 'Последняя четверть';
      emoji = '🌗';
      image = 'https://readdy.ai/api/search-image?query=3D%20rendered%20last%20quarter%20moon%20without%20circle%20frame%2C%20half%20lunar%20phase%2C%20realistic%203D%20moon%20model%2C%20detailed%20lunar%20surface%2C%20cinematic%20lighting%2C%20space%20illustration%2C%20astronomical%203D%20rendering%2C%20no%20background%20circle&width=80&height=80&seq=3dlastquarter2&orientation=squarish';
    } else {
      phase = 'Убывающая луна';
      emoji = '🌘';
      image = 'https://readdy.ai/api/search-image?query=3D%20rendered%20waning%20crescent%20moon%20without%20circle%20frame%2C%20thin%20lunar%20crescent%2C%20realistic%203D%20moon%20model%2C%20detailed%20surface%2C%20cinematic%20space%20lighting%2C%20astronomical%203D%20illustration%2C%20no%20background%20circle&width=80&height=80&seq=3dwaningcrescent2&orientation=squarish';
    }
    
    let illumination: number;
    if (currentCyclePosition <= lunarCycle / 2) {
      illumination = (currentCyclePosition / (lunarCycle / 2)) * 100;
    } else {
      illumination = ((lunarCycle - currentCyclePosition) / (lunarCycle / 2)) * 100;
    }
    
    const daysToFullMoon = lunarCycle / 2 - (currentCyclePosition % (lunarCycle / 2));
    const nextFullMoonDate = new Date(now.getTime() + daysToFullMoon * 24 * 60 * 60 * 1000);
    
    const nextFullMoon = nextFullMoonDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    });

    setMoonPhase({
      phase,
      isWaxing,
      illumination: Math.round(illumination),
      nextFullMoon,
      emoji,
      image
    });
  };

  const loadHomeData = async () => {
    try {
      console.log('Проверка статуса пользователя на главной странице...');
      await dbManager.init();
      
      const telegramId = getTelegramUserId();
      const existingUser = await dbManager.getUserByTelegramId(telegramId);
      
      if (existingUser) {
        console.log('Пользователь найден, загружаем главную страницу');
        setUserProfile(existingUser);
        await loadAskezas();
      } else {
        console.log('Пользователь не найден, переход на онбординг');
        navigate('/onboarding', { replace: true });
        return;
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Ошибка проверки пользователя:', error);
      setLoading(false);
    }
  };

  // Получаем данные пользователя
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Доброе утро' : currentHour < 18 ? 'Добрый день' : 'Добрый вечер';
  const userName = userProfile?.name || getTelegramUserData().first_name || 'Друг';

  // Дата и форматирование
  const today = new Date();
  const formattedDate = today.toLocaleDateString('ru-RU', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long' 
  });

  const handleCompleteAskeza = async (id: number) => {
    try {
      const askeza = askezas.find(a => a.id === id);
      if (!askeza || askeza.currentDay >= askeza.duration || checkTodayCompletion(askeza)) return;

      const newCurrentDay = askeza.currentDay + 1;
      await dbManager.updateAskezaEntry(id, { current_day: newCurrentDay });
      
      const todayStr = new Date().toDateString();
      localStorage.setItem(`askeza_${id}_last_completed`, todayStr);
      
      setShowCompletionMenu(null);
      
      await loadAskezas();
    } catch (error) {
      console.error('Ошибка выполнения аскезы:', error);
    }
  };

  const checkTodayCompletion = (askeza: AskezaItem): boolean => {
    const todayStr = new Date().toDateString();
    const lastCompleted = localStorage.getItem(`askeza_${askeza.id}_last_completed`);
    return lastCompleted === todayStr;
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Красивый градиентный фон */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
        
        {/* Анимированные частицы */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Основной контент загрузчика */}
        <div className="relative z-10 text-center">
          {/* Логотип */}
          <h1 
            className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse mb-8"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            COMPASS
          </h1>
          
          {/* Анимированный спиннер */}
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin mx-auto"
                 style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          
          {/* Текст загрузки */}
          <p className="text-white/70 text-lg mb-2">Загрузка...</p>
          <p className="text-white/50 text-sm">Подготавливаем ваш персональный опыт</p>
          
          {/* Анимированные точки */}
          <div className="flex justify-center space-x-2 mt-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        {/* Декоративные элементы */}
        <div className="absolute top-10 left-10 w-4 h-4 border-2 border-purple-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-2 h-2 bg-cyan-400/40 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 left-20 w-3 h-3 border border-pink-400/30 rotate-45 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-6 h-6 border-2 border-purple-400/20 rounded-full animate-pulse delay-1000"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Динамический фон */}
      <DynamicBackground />
      
      {/* Фиксированный стеклянный хедер */}
      <div className="fixed top-0 left-0 right-0 z-50 pt-6 pb-4 px-4 text-center"
           style={{
             background: 'rgba(255, 255, 255, 0.02)',
             backdropFilter: 'blur(20px)',
             WebkitBackdropFilter: 'blur(20px)',
             border: '1px solid rgba(255, 255, 255, 0.1)',
             borderTop: 'none',
             borderLeft: 'none',
             borderRight: 'none',
             boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
           }}>
        <h1 
          className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-lavender-400 bg-clip-text text-transparent animate-pulse mb-2"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          COMPASS
        </h1>
        <p className="text-white/80 text-sm">Ваш наставник на каждый день</p>
      </div>

      {/* Статичный блок информации на заднем фоне справа сверху вниз */}
      <div className="fixed top-32 right-4 z-10 text-right">
        <h2 className="text-white text-xl font-bold mb-1">
          {greeting}, {userName}!
        </h2>
        <p className="text-white/70 text-sm mb-4">{formattedDate}</p>
        
        {/* Статистика вертикально */}
        <div className="space-y-4">
          {/* Завершенные аскезы с неоновой иконкой */}
          <div className="text-right">
            <div className="flex items-center justify-end space-x-2 mb-1">
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                   style={{
                     boxShadow: '0 0 15px rgba(6, 182, 212, 0.6), 0 0 30px rgba(6, 182, 212, 0.3)'
                   }}>
                <i className="ri-trophy-fill text-white text-sm"></i>
              </div>
              <div className="text-cyan-400 text-xl font-bold"
                   style={{
                     textShadow: '0 0 10px rgba(6, 182, 212, 0.8)'
                   }}>
                {completedAskezas}
              </div>
            </div>
            <div className="text-white/60 text-xs">завершено</div>
          </div>

          {/* Энергия */}
          <div className="text-right">
            <div className="text-purple-300 text-xl font-bold">{energy}</div>
            <div className="text-white/60 text-xs">энергии</div>
          </div>

          {/* Информация о луне справа под энергией */}
          {moonPhase && (
            <div className="text-right mt-6 pt-4 border-t border-white/20">
              <div className="text-white text-sm font-medium mb-1">{moonPhase.phase}</div>
              <div className="text-white/70 text-xs mb-1">{moonPhase.illumination}%</div>
              {/* Прогресс фазы луны */}
              <div className="w-full h-2 rounded-full overflow-hidden mb-1"
                   style={{
                     background: 'rgba(255,255,255,0.12)'
                   }}>
                <div
                  className="h-full"
                  style={{
                    width: `${moonPhase.illumination}%`,
                    background: moonPhase.isWaxing
                      ? 'linear-gradient(90deg, #0ea5e9 0%, #22d3ee 100%)'
                      : 'linear-gradient(270deg, #fb923c 0%, #f97316 100%)',
                    transition: 'width 0.6s ease'
                  }}
                />
              </div>
              <div className="text-purple-300 text-xs">Полнолуние: {moonPhase.nextFullMoon}</div>
            </div>
          )}
        </div>
      </div>

      {/* Основная информация поверх фона */}
      <div className="relative z-10">
        {/* Отступ для фиксированного хедера */}
        <div className="h-32"></div>

        {/* Скроллируемый контент с виджетами - увеличен отступ сверху */}
        <div className="relative z-20" style={{ marginTop: '45vh' }}>
          {/* Виджеты */}
          <div className="px-4 space-y-4">
            {/* Аскеза виджеты - показываем все с галочкой "На главной" */}
            {activeWidgets.includes('askeza') && askezas.map((askeza) => (
              <div key={askeza.id} className="relative backdrop-blur-xl bg-white/8 border border-white/20 rounded-2xl p-4 hover:bg-white/12 transition-all duration-300 overflow-hidden"
                   style={{
                     boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 20px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                     backdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                     WebkitBackdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                   }}>
                {/* Стеклянный эффект преломления */}
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
                
                {/* Блик как в iOS */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                
                {/* Контент */}
                <div className="relative z-10">
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
                        {checkTodayCompletion(askeza) && (
                          <p className="text-green-400 text-xs mt-1">✓ Выполнено сегодня</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Кнопка выполнения */}
                    <button
                      onClick={() => {
                        if (askeza.isActive && !checkTodayCompletion(askeza) && askeza.currentDay < askeza.duration) {
                          setShowCompletionMenu(askeza.id);
                        }
                      }}
                      disabled={!askeza.isActive || checkTodayCompletion(askeza) || askeza.currentDay >= askeza.duration}
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group ${
                        !askeza.isActive
                          ? 'bg-gray-500/30 cursor-not-allowed'
                          : checkTodayCompletion(askeza) 
                          ? 'bg-green-500/50 cursor-not-allowed' 
                          : askeza.currentDay >= askeza.duration
                          ? 'bg-gray-500/50 cursor-not-allowed'
                          : `bg-gradient-to-r ${askeza.color} hover:scale-110`
                      }`}
                      style={askeza.isActive && !checkTodayCompletion(askeza) && askeza.currentDay < askeza.duration ? {
                        boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)'
                      } : undefined}
                    >
                      <i className={`text-white text-xl transition-transform duration-300 ${
                        !askeza.isActive
                          ? 'ri-lock-line'
                          : checkTodayCompletion(askeza) 
                          ? 'ri-check-line' 
                          : askeza.currentDay >= askeza.duration
                          ? 'ri-trophy-line'
                          : 'ri-add-line group-hover:rotate-90'
                      }`}></i>
                      {askeza.isActive && !checkTodayCompletion(askeza) && askeza.currentDay < askeza.duration && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      )}
                    </button>
                  </div>

                  {/* Прогресс-бар */}
                  <div className="mb-2">
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${askeza.color} rounded-full transition-all duration-500`}
                        style={{ width: `${(askeza.currentDay / askeza.duration) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-white/60 text-xs">0%</span>
                      <span className="text-cyan-400 text-xs font-semibold">{Math.round((askeza.currentDay / askeza.duration) * 100)}%</span>
                      <span className="text-white/60 text-xs">100%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* График эмоций виджет */}
            {activeWidgets.includes('emotion-chart') && (
              <div className="relative backdrop-blur-xl bg-white/8 border border-white/20 rounded-2xl overflow-hidden"
                   style={{
                     boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 20px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                     backdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                     WebkitBackdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                   }}>
                {/* Стеклянный эффект преломления */}
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
                <div className="relative z-10">
                  <EmotionChart />
                </div>
              </div>
            )}

            {/* Медитация виджет */}
            {activeWidgets.includes('meditation') && (
              <div className="relative backdrop-blur-xl bg-white/8 border border-white/20 rounded-2xl p-4 overflow-hidden"
                   style={{
                     boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 20px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                     backdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                     WebkitBackdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                   }}>
                {/* Стеклянный эффект преломления */}
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
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-500">
                      <i className="ri-leaf-line text-white text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white text-base font-semibold">Медитация</h3>
                      <p className="text-white/70 text-sm">Практики осознанности</p>
                    </div>
                  </div>
                  <NeonButton 
                    className="w-full py-2"
                    onClick={() => setShowMeditationModal(true)}
                  >
                    <i className="ri-play-line mr-2"></i>
                    Начать сессию
                  </NeonButton>
                </div>
              </div>
            )}

            {/* Благодарности виджет */}
            {activeWidgets.includes('gratitude') && (
              <div className="relative backdrop-blur-xl bg-white/8 border border-white/20 rounded-2xl p-4 overflow-hidden"
                   style={{
                     boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 20px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                     backdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                     WebkitBackdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                   }}>
                {/* Стеклянный эффект преломления */}
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
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                      <i className="ri-gift-line text-white text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white text-base font-semibold">Благодарности</h3>
                      <p className="text-white/70 text-sm">За что вы благодарны сегодня?</p>
                    </div>
                  </div>
                  <NeonButton className="w-full py-2">
                    <i className="ri-add-line mr-2"></i>
                    Добавить запись
                  </NeonButton>
                </div>
              </div>
            )}

            {/* Прогноз на день виджет (PRO) */}
            {activeWidgets.includes('daily-forecast') && (
              <div className="relative backdrop-blur-xl bg-white/8 border border-white/20 rounded-2xl p-4 overflow-hidden"
                   style={{
                     boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 20px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                     backdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                     WebkitBackdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                   }}>
                {/* Стеклянный эффект преломления */}
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
                <div className="relative z-10">
                  <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                    <span className="text-white text-xs font-bold">PRO</span>
                  </div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-violet-400 to-purple-500">
                      <i className="ri-crystal-ball-line text-white text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white text-base font-semibold">Прогноз на день</h3>
                      <p className="text-white/70 text-sm">Персональные рекомендации</p>
                    </div>
                  </div>
                  <NeonButton className="w-full py-2">
                    <i className="ri-magic-line mr-2"></i>
                    Получить прогноз
                  </NeonButton>
                </div>
              </div>
            )}

            {/* Архетипы Юнга виджет (PRO) */}
            {activeWidgets.includes('jung-archetypes') && (
              <div className="relative backdrop-blur-xl bg-white/8 border border-white/20 rounded-2xl p-4 overflow-hidden"
                   style={{
                     boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 20px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                     backdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                     WebkitBackdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                   }}>
                {/* Стеклянный эффект преломления */}
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
                <div className="relative z-10">
                  <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                    <span className="text-white text-xs font-bold">PRO</span>
                  </div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-400 to-blue-500">
                      <i className="ri-user-heart-line text-white text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white text-base font-semibold">Архетипы Юнга</h3>
                      <p className="text-white/70 text-sm">Психологический анализ</p>
                    </div>
                  </div>
                  <NeonButton className="w-full py-2">
                    <i className="ri-psychology-line mr-2"></i>
                    Пройти тест
                  </NeonButton>
                </div>
              </div>
            )}

            {/* Кнопка добавления виджетов */}
            <button
              onClick={() => setShowWidgetMenu(true)}
              className="relative w-full p-4 border-2 border-dashed border-white/20 rounded-2xl hover:border-cyan-400/5 hover:bg-cyan-400/5 transition-all duration-300 group overflow-hidden backdrop-blur-xl"
              style={{
                backdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
              }}
            >
              {/* Стеклянный эффект преломления */}
              <div 
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: `
                    linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 50%, rgba(255, 255, 255, 0.02) 100%),
                    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
                  `,
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 group-hover:bg-cyan-400/20 transition-colors">
                    <i className="ri-add-line text-white/60 group-hover:text-cyan-400 text-xl transition-colors"></i>
                  </div>
                  <div>
                    <h3 className="text-white/60 group-hover:text-cyan-400 text-base font-medium transition-colors">
                      Добавить виджет
                    </h3>
                    <p className="text-white/40 text-sm">
                      Настройте главную страницу
                    </p>
                  </div>
                </div>
              </div>
            </button>

            {/* Отступ для нижней навигации */}
            <div className="h-24"></div>
          </div>
        </div>
      </div>

      {/* Меню виджетов */}
      <WidgetMenu
        isOpen={showWidgetMenu}
        onClose={() => setShowWidgetMenu(false)}
        currentWidgets={activeWidgets}
      />

      {/* Меню выполнения аскезы */}
      {showCompletionMenu && (
        <AskezaCompletionMenu
          isOpen={showCompletionMenu !== null}
          onClose={() => setShowCompletionMenu(null)}
          onComplete={() => handleCompleteAskeza(showCompletionMenu)}
          askezaTitle={askezas.find(a => a.id === showCompletionMenu)?.title || ''}
          askezaColor={askezas.find(a => a.id === showCompletionMenu)?.color || 'from-yellow-400 to-orange-500'}
          currentDay={askezas.find(a => a.id === showCompletionMenu)?.currentDay || 0}
          totalDays={askezas.find(a => a.id === showCompletionMenu)?.duration || 1}
        />
      )}

      {/* Модальное окно медитации */}
      <MeditationModal
        isOpen={showMeditationModal}
        onClose={() => setShowMeditationModal(false)}
      />

      {/* Нижняя навигация */}
      <BottomNavigation />
    </div>
  );
}