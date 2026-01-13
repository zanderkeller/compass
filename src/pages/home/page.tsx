import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/feature/BottomNavigation';
import EmotionChart from '../../components/feature/EmotionChart';
import AskezaCompletionMenu from '../../components/feature/AskezaCompletionMenu';
import WidgetMenu from '../../components/feature/WidgetMenu';
import MeditationModal from '../../components/feature/MeditationModal';
import { dbManager, getTelegramUserId, getTelegramUserData, type UserProfile } from '../../utils/database';
import NeonButton from '../../components/base/NeonButton';

// === Background types/helpers ===
type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

function getTimeOfDay(date = new Date()): TimeOfDay {
  const h = date.getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'day';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

// Вычисление реальной фазы луны (0 = новолуние, 0.5 = полнолуние)
function getMoonPhase(date = new Date()): number {
  const LUNAR_CYCLE = 29.53059;
  const KNOWN_NEW_MOON = new Date('2024-01-11T11:57:00Z').getTime();
  const diff = date.getTime() - KNOWN_NEW_MOON;
  const days = diff / (1000 * 60 * 60 * 24);
  const phase = (days % LUNAR_CYCLE) / LUNAR_CYCLE;
  return phase < 0 ? phase + 1 : phase;
}

// Расчёт даты следующего полнолуния
function getNextFullMoon(date = new Date()): Date {
  const LUNAR_CYCLE = 29.53059;
  const KNOWN_FULL_MOON = new Date('2024-12-15T09:02:00Z').getTime();
  const diff = date.getTime() - KNOWN_FULL_MOON;
  const daysSinceFull = diff / (1000 * 60 * 60 * 24);
  const cyclePosition = daysSinceFull % LUNAR_CYCLE;
  const daysUntilNext = cyclePosition < 0 ? -cyclePosition : (LUNAR_CYCLE - cyclePosition);
  return new Date(date.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
}

// Получение названия фазы луны на русском
function getMoonPhaseName(phase: number): { name: string; isWaxing: boolean } {
  if (phase < 0.03 || phase > 0.97) return { name: 'Новолуние', isWaxing: true };
  if (phase < 0.22) return { name: 'Растущий серп', isWaxing: true };
  if (phase < 0.28) return { name: 'Первая четверть', isWaxing: true };
  if (phase < 0.47) return { name: 'Растущая луна', isWaxing: true };
  if (phase < 0.53) return { name: 'Полнолуние', isWaxing: false };
  if (phase < 0.72) return { name: 'Убывающая луна', isWaxing: false };
  if (phase < 0.78) return { name: 'Последняя четверть', isWaxing: false };
  return { name: 'Убывающий серп', isWaxing: false };
}

// Анимированный фон на чистом CSS
function BackgroundLayer({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  // Палитры для каждого времени суток в пастельных тонах
  const palettes = {
    morning: {
      sky: ['#1a1a2e', '#16213e', '#1f4068', '#7b2cbf'],
      orbs: ['rgba(255, 182, 193, 0.4)', 'rgba(255, 218, 185, 0.3)', 'rgba(255, 160, 122, 0.25)'],
      glow: 'rgba(255, 183, 77, 0.15)',
      stars: false,
    },
    day: {
      sky: ['#0f172a', '#1e3a5f', '#2563eb', '#60a5fa'],
      orbs: ['rgba(147, 197, 253, 0.3)', 'rgba(196, 181, 253, 0.25)', 'rgba(167, 243, 208, 0.2)'],
      glow: 'rgba(96, 165, 250, 0.1)',
      stars: false,
    },
    evening: {
      sky: ['#0f0f1a', '#1a0a2e', '#4a1942', '#c2185b'],
      orbs: ['rgba(255, 105, 135, 0.35)', 'rgba(255, 183, 77, 0.3)', 'rgba(186, 104, 200, 0.25)'],
      glow: 'rgba(255, 138, 101, 0.15)',
      stars: true,
    },
    night: {
      sky: ['#020617', '#0f172a', '#1e293b', '#334155'],
      orbs: ['rgba(99, 102, 241, 0.3)', 'rgba(139, 92, 246, 0.25)', 'rgba(59, 130, 246, 0.2)'],
      glow: 'rgba(99, 102, 241, 0.1)',
      stars: true,
    },
  };

  const palette = palettes[timeOfDay];

  return (
    <>
      <div className="fixed inset-0 -z-20 overflow-hidden" style={{ pointerEvents: 'none' }} aria-hidden>
        {/* Основной градиент неба */}
        <div
          className="absolute inset-0 transition-all duration-[3000ms]"
          style={{
            background: `linear-gradient(180deg, ${palette.sky[0]} 0%, ${palette.sky[1]} 30%, ${palette.sky[2]} 60%, ${palette.sky[3]} 100%)`,
          }}
        />

        {/* Анимированные пастельные орбы */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] animate-[float1_20s_ease-in-out_infinite]"
          style={{
            background: palette.orbs[0],
            top: '-10%',
            right: '-15%',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] animate-[float2_25s_ease-in-out_infinite]"
          style={{
            background: palette.orbs[1],
            bottom: '20%',
            left: '-20%',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[80px] animate-[float3_18s_ease-in-out_infinite]"
          style={{
            background: palette.orbs[2],
            top: '40%',
            right: '10%',
          }}
        />

        {/* Центральное свечение */}
        <div
          className="absolute w-[800px] h-[400px] rounded-full blur-[150px] animate-[pulse-glow_8s_ease-in-out_infinite]"
          style={{
            background: palette.glow,
            top: '60%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />

        {/* Звёзды для вечера и ночи */}
        {palette.stars && (
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white animate-[twinkle_3s_ease-in-out_infinite]"
                style={{
                  width: `${1 + Math.random() * 2}px`,
                  height: `${1 + Math.random() * 2}px`,
                  top: `${Math.random() * 60}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0.3 + Math.random() * 0.5,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Волнистые линии света */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,400 Q200,350 400,400 T800,400 T1200,400"
            stroke="url(#wave-gradient)"
            strokeWidth="1"
            fill="none"
            className="animate-[wave-move_15s_linear_infinite]"
          />
          <path
            d="M0,500 Q200,450 400,500 T800,500 T1200,500"
            stroke="url(#wave-gradient)"
            strokeWidth="0.5"
            fill="none"
            className="animate-[wave-move_20s_linear_infinite]"
            style={{ animationDelay: '-5s' }}
          />
        </svg>

        {/* Градиент размытия снизу */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${palette.sky[0]}80 50%, ${palette.sky[0]} 100%)`,
          }}
        />

        {/* Лёгкий шум/текстура */}
        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Keyframes для анимаций */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-30px, 20px) scale(1.05); }
          50% { transform: translate(-20px, -30px) scale(0.95); }
          75% { transform: translate(20px, 10px) scale(1.02); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -20px) scale(1.08); }
          66% { transform: translate(-30px, 30px) scale(0.92); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-50px, -40px) rotate(10deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.6; transform: translateX(-50%) scale(1.1); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes wave-move {
          0% { transform: translateX(-400px); }
          100% { transform: translateX(400px); }
        }
      `}</style>
    </>
  );
}

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

  // Time-of-day state
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getTimeOfDay());
  useEffect(() => {
    const id = setInterval(() => setTimeOfDay(getTimeOfDay()), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);


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

      const dbAskezas = await dbManager.getAskezaEntriesByTelegramId(telegramId);
      console.log('Загружено аскез из базы:', dbAskezas.length);

      const formattedAskezas: AskezaItem[] = dbAskezas
        .filter(askeza => {
          console.log(`Аскеза "${askeza.title}": show_on_home=${askeza.show_on_home}, is_active=${askeza.is_active}`);
          const showOnHome = askeza.show_on_home;
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
    const phase = getMoonPhase(now);
    const { name: phaseName, isWaxing } = getMoonPhaseName(phase);
    const nextFullMoonDate = getNextFullMoon(now);
    
    // Освещённость: 0% при новолунии, 100% при полнолунии
    const illumination = Math.round(
      phase <= 0.5 
        ? (phase / 0.5) * 100 
        : ((1 - phase) / 0.5) * 100
    );

    const nextFullMoon = nextFullMoonDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    });

    setMoonPhase({
      phase: phaseName,
      isWaxing,
      illumination,
      nextFullMoon,
      emoji: '',
      image: ''
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

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Доброе утро' : currentHour < 18 ? 'Добрый день' : 'Добрый вечер';
  const userName = userProfile?.name || getTelegramUserData().first_name || 'Друг';

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
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>

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

        <div className="relative z-10 text-center">
          <h1 
            className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse mb-8"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            COMPASS
          </h1>

          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin mx-auto"
                 style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>

          <p className="text-white/70 text-lg mb-2">Загрузка...</p>
          <p className="text-white/50 text-sm">Подготавливаем ваш персональный опыт</p>

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
      <BackgroundLayer timeOfDay={timeOfDay} />

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

          {/* Информация о луне - компактный дизайн без рамки */}
          {moonPhase && (
            <div className="mt-4 pt-3">
              {/* Название фазы с иконкой */}
              <div className="flex items-center justify-end gap-2 mb-1.5">
                <span className="text-xl">
                  {moonPhase.phase === 'Новолуние' ? '🌑' :
                   moonPhase.phase === 'Растущий серп' ? '🌒' :
                   moonPhase.phase === 'Первая четверть' ? '🌓' :
                   moonPhase.phase === 'Растущая луна' ? '🌔' :
                   moonPhase.phase === 'Полнолуние' ? '🌕' :
                   moonPhase.phase === 'Убывающая луна' ? '🌖' :
                   moonPhase.phase === 'Последняя четверть' ? '🌗' : '🌘'}
                </span>
                <span className="text-white/80 text-sm">{moonPhase.phase}</span>
                <span className="text-white/60 text-xs">({moonPhase.illumination}%)</span>
              </div>

              {/* Компактная градиентная шкала */}
              <div className="relative h-1.5 rounded-full overflow-hidden mb-1.5"
                   style={{
                     background: 'linear-gradient(90deg, rgba(30, 40, 80, 0.6) 0%, rgba(60, 80, 140, 0.4) 100%)',
                   }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${moonPhase.illumination}%`,
                    background: 'linear-gradient(90deg, rgba(147, 197, 253, 0.8) 0%, rgba(219, 234, 254, 1) 100%)',
                    boxShadow: '0 0 8px rgba(147, 197, 253, 0.5)',
                    transition: 'width 0.8s ease'
                  }}
                />
              </div>

              {/* Дата полнолуния */}
              <div className="text-right text-xs text-white/40">
                Полнолуние: <span className="text-blue-300/70">{moonPhase.nextFullMoon}</span>
              </div>
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
                      radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
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
                      radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
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
