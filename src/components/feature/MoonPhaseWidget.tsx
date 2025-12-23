
import { useState, useEffect } from 'react';
import GlassCard from '../base/GlassCard';

interface MoonPhase {
  phase: string;
  illumination: number;
  nextFullMoon: string;
  emoji: string;
  image: string;
  isWaxing: boolean;
}

export default function MoonPhaseWidget() {
  const [moonPhase, setMoonPhase] = useState<MoonPhase | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    calculateMoonPhase();
  }, []);

  const calculateMoonPhase = () => {
    const now = new Date();
    
    // Известная дата новолуния: 1 января 2000, 18:14 UTC
    const knownNewMoon = new Date('2000-01-06T18:14:00Z');
    const lunarCycle = 29.53058867; // дней в лунном цикле
    
    // Вычисляем количество дней с известного новолуния
    const daysSinceKnownNewMoon = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    
    // Находим текущую позицию в лунном цикле
    const currentCyclePosition = daysSinceKnownNewMoon % lunarCycle;
    
    // Определяем фазу луны
    let phase: string;
    let emoji: string;
    let image: string;
    let isWaxing: boolean;
    
    if (currentCyclePosition < 1) {
      phase = 'Новолуние';
      emoji = '🌑';
      image = 'https://readdy.ai/api/search-image?query=new%20moon%20phase%2C%20dark%20moon%20silhouette%2C%20night%20sky%2C%20astronomical%20illustration%2C%20black%20circle%20moon%2C%20minimal%20design%2C%20space%20photography%2C%20lunar%20cycle&width=100&height=100&seq=newmoon1&orientation=squarish';
      isWaxing = true;
    } else if (currentCyclePosition < 7.4) {
      phase = 'Растущая луна';
      emoji = '🌒';
      image = 'https://readdy.ai/api/search-image?query=waxing%20crescent%20moon%2C%20growing%20moon%20phase%2C%20lunar%20crescent%2C%20night%20sky%2C%20astronomical%20photography%2C%20silver%20moon%2C%20space%20illustration&width=100&height=100&seq=waxing1&orientation=squarish';
      isWaxing = true;
    } else if (currentCyclePosition < 8.4) {
      phase = 'Первая четверть';
      emoji = '🌓';
      image = 'https://readdy.ai/api/search-image?query=first%20quarter%20moon%20phase%2C%20half%20moon%2C%20lunar%20photography%2C%20night%20sky%2C%20astronomical%20illustration%2C%20silver%20moon%2C%20space%20photography&width=100&height=100&seq=firstquarter1&orientation=squarish';
      isWaxing = true;
    } else if (currentCyclePosition < 14.8) {
      phase = 'Растущая луна';
      emoji = '🌔';
      image = 'https://readdy.ai/api/search-image?query=waxing%20gibbous%20moon%2C%20almost%20full%20moon%2C%20lunar%20phase%2C%20night%20sky%2C%20bright%20moon%2C%20astronomical%20photography%2C%20silver%20moon&width=100&height=100&seq=waxinggibbous1&orientation=squarish';
      isWaxing = true;
    } else if (currentCyclePosition < 15.8) {
      phase = 'Полнолуние';
      emoji = '🌕';
      image = 'https://readdy.ai/api/search-image?query=full%20moon%2C%20bright%20full%20moon%2C%20lunar%20photography%2C%20night%20sky%2C%20complete%20moon%20phase%2C%20silver%20bright%20moon%2C%20astronomical%20illustration&width=100&height=100&seq=fullmoon1&orientation=squarish';
      isWaxing = false;
    } else if (currentCyclePosition < 22.1) {
      phase = 'Убывающая луна';
      emoji = '🌖';
      image = 'https://readdy.ai/api/search-image?query=waning%20gibbous%20moon%2C%20decreasing%20moon%20phase%2C%20lunar%20photography%2C%20night%20sky%2C%20astronomical%20illustration%2C%20silver%20moon&width=100&height=100&seq=waninggibbous1&orientation=squarish';
      isWaxing = false;
    } else if (currentCyclePosition < 23.1) {
      phase = 'Последняя четверть';
      emoji = '🌗';
      image = 'https://readdy.ai/api/search-image?query=last%20quarter%20moon%20phase%2C%20half%20moon%2C%20lunar%20photography%2C%20night%20sky%2C%20astronomical%20illustration%2C%20silver%20moon%2C%20space%20photography&width=100&height=100&seq=lastquarter1&orientation=squarish';
      isWaxing = false;
    } else {
      phase = 'Убывающая луна';
      emoji = '🌘';
      image = 'https://readdy.ai/api/search-image?query=waning%20crescent%20moon%2C%20thin%20moon%20crescent%2C%20lunar%20phase%2C%20night%20sky%2C%20astronomical%20photography%2C%20silver%20moon%2C%20space%20illustration&width=100&height=100&seq=waningcrescent1&orientation=squarish';
      isWaxing = false;
    }
    
    // Вычисляем освещенность (0-100%)
    let illumination: number;
    if (currentCyclePosition <= lunarCycle / 2) {
      illumination = (currentCyclePosition / (lunarCycle / 2)) * 100;
    } else {
      illumination = ((lunarCycle - currentCyclePosition) / (lunarCycle / 2)) * 100;
    }
    
    // Находим следующее полнолуние
    const daysToFullMoon = lunarCycle / 2 - (currentCyclePosition % (lunarCycle / 2));
    const nextFullMoonDate = new Date(now.getTime() + daysToFullMoon * 24 * 60 * 60 * 1000);
    
    const nextFullMoon = nextFullMoonDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    });

    setMoonPhase({
      phase,
      illumination: Math.round(illumination),
      nextFullMoon,
      emoji,
      image,
      isWaxing
    });

    // Запускаем анимацию вращения
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      setLoading(false);
    }, 2000);
  };

  if (loading || !moonPhase) {
    return (
      <GlassCard className="p-6" variant="elevated">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <div 
              className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center animate-pulse"
              style={{
                boxShadow: '0 0 20px rgba(34, 211, 238, 0.5)',
              }}
            >
              <i className="ri-moon-line text-white text-xl"></i>
            </div>
          </div>
          <p className="text-white/70 text-sm font-medium">Вычисляем фазу луны...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6" variant="elevated">
      <div className="text-center">
        {/* Луна */}
        <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          {isAnimating ? (
            <div 
              className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-300 to-blue-500 flex items-center justify-center"
              style={{
                animation: 'moonSpin 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                boxShadow: '0 0 25px rgba(34, 211, 238, 0.6)',
              }}
            >
              <i className="ri-moon-line text-white text-2xl"></i>
            </div>
          ) : (
            <div
              style={{
                boxShadow: '0 0 25px rgba(34, 211, 238, 0.4), inset 0 0 15px rgba(0, 0, 0, 0.2)',
                borderRadius: '50%',
              }}
            >
              <img 
                src={moonPhase.image} 
                alt={moonPhase.phase}
                className="w-16 h-16 rounded-full object-cover"
                style={{
                  filter: 'brightness(1.3) contrast(1.2)',
                }}
              />
            </div>
          )}
        </div>
        
        {/* Название фазы */}
        <h3 className="text-white text-lg font-bold mb-1">{moonPhase.phase}</h3>
        <p className="text-cyan-300 text-xs font-semibold mb-4">{moonPhase.emoji}</p>
        
        {/* Шкала прогресса луны */}
        <div className="mb-4">
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden relative backdrop-blur-sm border border-white/10">
            {moonPhase.isWaxing ? (
              // Растущая луна - синий градиент слева направо
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 rounded-full transition-all duration-700"
                style={{ 
                  width: `${moonPhase.illumination}%`,
                  boxShadow: '0 0 15px rgba(34, 211, 238, 0.6)'
                }}
              />
            ) : (
              // Убывающая луна - оранжевый градиент справа налево
              <div 
                className="h-full bg-gradient-to-l from-orange-400 via-amber-500 to-yellow-500 rounded-full transition-all duration-700 ml-auto"
                style={{ 
                  width: `${moonPhase.illumination}%`,
                  boxShadow: '0 0 15px rgba(251, 146, 60, 0.6)'
                }}
              />
            )}
          </div>
          <div className="flex justify-between mt-2 px-1">
            <span className="text-white/50 text-xs">0%</span>
            <span className={`text-xs font-bold ${moonPhase.isWaxing ? 'text-cyan-300' : 'text-orange-300'}`}>
              {moonPhase.illumination}%
            </span>
            <span className="text-white/50 text-xs">100%</span>
          </div>
        </div>
        
        {/* Следующее полнолуние */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
          <p className="text-white/60 text-xs mb-1">Полнолуние</p>
          <p className="text-cyan-300 text-sm font-semibold">{moonPhase.nextFullMoon}</p>
        </div>
      </div>

      <style>{`
        @keyframes moonSpin {
          0% {
            transform: rotate(0deg) scale(1);
            opacity: 1;
          }
          50% {
            transform: rotate(180deg) scale(1.1);
          }
          100% {
            transform: rotate(360deg) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </GlassCard>
  );
}

