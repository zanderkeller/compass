
import { useEffect, useState } from 'react';
import { dbManager, getTelegramUserId } from '../../utils/database';

interface DynamicBackgroundProps {
  className?: string;
}

type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';
type BackgroundMode = 'auto' | 'morning' | 'day' | 'evening' | 'night';

export default function DynamicBackground({ className = '' }: DynamicBackgroundProps) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('auto');
  const [effectiveTimeOfDay, setEffectiveTimeOfDay] = useState<TimeOfDay>('morning');

  // Загрузка настроек фона из базы данных
  useEffect(() => {
    const loadBackgroundSettings = async () => {
      try {
        const telegramId = getTelegramUserId();
        if (telegramId === 212879920) { // Только для админа
          await dbManager.init();
          const clientProfile = await dbManager.getClientProfileByTelegramId(telegramId);
          
          if (clientProfile && clientProfile.settings) {
            try {
              const settings = JSON.parse(clientProfile.settings);
              if (settings.backgroundMode) {
                setBackgroundMode(settings.backgroundMode);
              }
            } catch (e) {
              console.error('Ошибка парсинга настроек фона:', e);
            }
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки настроек фона:', error);
      }
    };

    loadBackgroundSettings();

    // Слушаем изменения настроек фона
    const handleBackgroundModeChanged = (event: CustomEvent) => {
      setBackgroundMode(event.detail);
    };

    window.addEventListener('backgroundModeChanged', handleBackgroundModeChanged as EventListener);

    return () => {
      window.removeEventListener('backgroundModeChanged', handleBackgroundModeChanged as EventListener);
    };
  }, []);

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 12) {
        setTimeOfDay('morning');
      } else if (hour >= 12 && hour < 17) {
        setTimeOfDay('day');
      } else if (hour >= 17 && hour < 21) {
        setTimeOfDay('evening');
      } else if (hour >= 21 || hour < 5) {
        setTimeOfDay('night');
      }
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Обновляем каждую минуту

    return () => clearInterval(interval);
  }, []);

  // Определяем эффективное время суток в зависимости от режима
  useEffect(() => {
    if (backgroundMode === 'auto') {
      setEffectiveTimeOfDay(timeOfDay);
    } else {
      setEffectiveTimeOfDay(backgroundMode as TimeOfDay);
    }
  }, [backgroundMode, timeOfDay]);

  useEffect(() => {
    // Создаем звезды для вечернего и ночного фона
    if (effectiveTimeOfDay === 'evening' || effectiveTimeOfDay === 'night') {
      createStars();
    }
  }, [effectiveTimeOfDay]);

  const createStars = () => {
    const starsContainer = document.querySelector('.stars-container');
    const starsCross = document.querySelector('.stars-cross');
    const starsCrossAux = document.querySelector('.stars-cross-aux');
    
    if (!starsContainer || !starsCross || !starsCrossAux) return;

    // Очищаем предыдущие звезды
    starsContainer.innerHTML = '';
    starsCross.innerHTML = '';
    starsCrossAux.innerHTML = '';

    const nightsky = ["#280F36", "#632B6C", "#BE6590", "#FFC1A0", "#FE9C7F"];

    // Создаем основные звезды - больше для ночи
    const starCount = effectiveTimeOfDay === 'night' ? 500 : 300;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = `star star-${Math.floor(Math.random() * 4)} ${Math.random() > 0.3 ? 'blink' : ''}`;
      star.style.top = `${Math.random() * 70}vh`; // Звезды в верхних 70% экрана
      star.style.left = `${Math.random() * 100}vw`;
      star.style.animationDuration = `${2 + Math.random() * 6}s`;
      starsContainer.appendChild(star);
    }

    // Создаем яркие звезды
    const brightStarCount = effectiveTimeOfDay === 'night' ? 80 : 50;
    for (let i = 0; i < brightStarCount; i++) {
      const star = document.createElement('div');
      star.className = 'star star-4 blink';
      star.style.top = `${Math.random() * 60}vh`; // Яркие звезды в верхних 60%
      star.style.left = `${Math.random() * 100}vw`;
      star.style.animationDuration = `${5 + Math.random() * 3}s`;
      starsContainer.appendChild(star);
    }

    // Создаем цветные звезды для крестов
    const crossStarCount = effectiveTimeOfDay === 'night' ? 150 : 100;
    for (let i = 0; i < crossStarCount; i++) {
      const blur = document.createElement('div');
      blur.className = 'blur';
      blur.style.top = `${Math.random() * 60}%`;
      blur.style.left = `${Math.random() * 100}%`;
      blur.style.backgroundColor = nightsky[Math.floor(Math.random() * nightsky.length)];
      starsCross.appendChild(blur);

      const colorStar = document.createElement('div');
      colorStar.className = 'star star-1 blink';
      colorStar.style.top = `${Math.random() * 60}%`;
      colorStar.style.left = `${Math.random() * 100}%`;
      colorStar.style.animationDuration = `${6 + Math.random() * 6}s`;
      colorStar.style.backgroundColor = nightsky[Math.floor(Math.random() * nightsky.length)];
      colorStar.style.boxShadow = `0px 0px 6px 1px ${nightsky[Math.floor(Math.random() * nightsky.length)]}`;
      starsCross.appendChild(colorStar);
    }

    // Дополнительные звезды
    const auxStarCount = effectiveTimeOfDay === 'night' ? 50 : 30;
    for (let i = 0; i < auxStarCount; i++) {
      const blur = document.createElement('div');
      blur.className = 'blur';
      blur.style.top = `${Math.random() * 50}%`;
      blur.style.left = `${Math.random() * 100}%`;
      blur.style.backgroundColor = nightsky[Math.floor(Math.random() * nightsky.length)];
      starsCrossAux.appendChild(blur);

      const colorStar = document.createElement('div');
      colorStar.className = 'star star-2';
      colorStar.style.top = `${Math.random() * 50}%`;
      colorStar.style.left = `${Math.random() * 100}%`;
      colorStar.style.animationDuration = `${4 + Math.random() * 6}s`;
      colorStar.style.backgroundColor = nightsky[Math.floor(Math.random() * nightsky.length)];
      colorStar.style.boxShadow = `0px 0px 10px 1px ${nightsky[Math.floor(Math.random() * nightsky.length)]}`;
      colorStar.style.opacity = '0.7';
      starsCrossAux.appendChild(colorStar);
    }
  };

  const getBackgroundStyle = () => {
    switch (effectiveTimeOfDay) {
      case 'morning':
        return {
          background: 'linear-gradient(135deg, #FFB347 0%, #FFCC5C 15%, #FFE4B5 30%, #87CEEB 50%, #E0FFFF 70%, #F0E68C 85%, #FFA07A 100%)',
          animation: 'morningGradient 8s ease-in-out infinite'
        };
      case 'day':
        return {
          background: 'linear-gradient(135deg, #87CEEB 0%, #98D8E8 20%, #B0E0E6 40%, #E0F6FF 60%, #F0F8FF 80%, #FFFFFF 100%)',
          animation: 'dayGradient 8s ease-in-out infinite'
        };
      case 'evening':
        return {
          background: 'linear-gradient(135deg, #2D1B69 0%, #4A2C85 10%, #663399 20%, #8B4A9C 30%, #B565A7 40%, #D4A5A5 50%, #E6C2A6 60%, #F4D4A7 70%, #FFC1A0 80%, #FE9C7F 90%, #FF8C69 100%)',
          animation: 'eveningGradient 8s ease-in-out infinite'
        };
      case 'night':
        return {
          background: 'linear-gradient(135deg, #0F172A 0%, #1a237e 15%, #283593 30%, #3949ab 45%, #2c387e 60%, #1a237e 75%, #0d1421 90%, #000051 100%)',
          animation: 'nightGradient 8s ease-in-out infinite'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #2D1B69 0%, #FF8C69 100%)'
        };
    }
  };

  const getMountainsColor = () => {
    switch (effectiveTimeOfDay) {
      case 'morning':
        return '#8B4513';
      case 'day':
        return '#654321';
      case 'evening':
        return '#1A0B2E';
      case 'night':
        return '#144569';
      default:
        return '#1A0B2E';
    }
  };

  const getLightBaseStyle = () => {
    switch (effectiveTimeOfDay) {
      case 'morning':
        return {
          background: '#FFD700',
          boxShadow: '0px -10px 30px 10px #FFD700, 0px -20px 40px 20px #FFA500, 0px -30px 60px 30px #FF6347, 0px -50px 150px 75px #FF4500',
          width: '120px',
          height: '120px'
        };
      case 'day':
        return {
          background: '#FFFF00',
          boxShadow: '0px -10px 30px 10px #FFFF00, 0px -20px 40px 20px #FFD700, 0px -30px 60px 30px #FFA500, 0px -50px 150px 75px #FF8C00',
          width: '120px',
          height: '120px'
        };
      case 'evening':
        return {
          background: '#ffc1a0',
          boxShadow: '0px -10px 30px 10px #ffc1a0, 0px -20px 40px 20px #fe9c7f, 0px -30px 60px 30px #be6590, 0px -50px 150px 75px #632b6c',
          width: '120px',
          height: '120px'
        };
      case 'night':
        return {
          background: '#ffffff',
          boxShadow: '0 0 0 0.62em rgba(32, 105, 149, 0.6), 0 0 0 1.25em rgba(32, 105, 149, 0.5), 0 0 0 1.9em rgba(32, 105, 149, 0.4)',
          width: '120px',
          height: '120px'
        };
      default:
        return {
          background: '#ffc1a0',
          boxShadow: '0px -10px 30px 10px #ffc1a0, 0px -20px 40px 20px #fe9c7f, 0px -30px 60px 30px #be6590, 0px -50px 150px 75px #632b6c',
          width: '120px',
          height: '120px'
        };
    }
  };

  return (
    <div className={`fixed inset-0 transition-all duration-1000 -z-10 ${className}`} style={getBackgroundStyle()}>
      {/* Звезды для вечера и ночи */}
      {(effectiveTimeOfDay === 'evening' || effectiveTimeOfDay === 'night') && (
        <>
          <div className="stars-container absolute top-0 left-0 w-full h-full"></div>
          <div className="stars-cross absolute top-[5vh] left-0 w-[120vw] h-[25vh] rotate-[20deg] origin-top-left"></div>
          <div className="stars-cross-aux absolute top-0 left-[10vw] w-[120vw] h-[15vh] rotate-[20deg] origin-top-left"></div>
          
          {/* Падающая звезда для ночи */}
          {effectiveTimeOfDay === 'night' && (
            <div className="shooting-star absolute top-[10%] right-[-10px] w-[40px] h-[2px] bg-white opacity-20 transform rotate-[-30deg]"></div>
          )}
        </>
      )}

      {/* Облака для утра, дня и ночи */}
      {(effectiveTimeOfDay === 'morning' || effectiveTimeOfDay === 'day' || effectiveTimeOfDay === 'night') && (
        <div className="clouds absolute top-0 left-0 w-full h-3/4 overflow-hidden">
          {effectiveTimeOfDay === 'night' ? (
            <>
              {/* Ночные облака - более темные и размытые */}
              <div className="cloud cloud-1 absolute top-[40%] left-[5%] w-32 h-16 bg-blue-900/20 rounded-full animate-float-slow blur-sm"></div>
              <div className="cloud cloud-2 absolute top-[50%] left-[70%] w-40 h-20 bg-blue-800/15 rounded-full animate-float-medium blur-sm"></div>
              <div className="cloud cloud-3 absolute top-[35%] left-[85%] w-28 h-14 bg-blue-900/25 rounded-full animate-float-fast blur-sm"></div>
              <div className="cloud cloud-4 absolute top-[60%] left-[20%] w-36 h-18 bg-blue-800/10 rounded-full animate-float-slow blur-sm"></div>
              <div className="cloud cloud-5 absolute top-[45%] left-[50%] w-24 h-12 bg-blue-900/20 rounded-full animate-float-medium blur-sm"></div>
            </>
          ) : (
            <>
              {/* Дневные облака */}
              <div className="cloud cloud-1 absolute top-[20%] left-[10%] w-24 h-12 bg-white/30 rounded-full animate-float-slow"></div>
              <div className="cloud cloud-2 absolute top-[30%] left-[60%] w-32 h-16 bg-white/25 rounded-full animate-float-medium"></div>
              <div className="cloud cloud-3 absolute top-[15%] left-[80%] w-20 h-10 bg-white/35 rounded-full animate-float-fast"></div>
              <div className="cloud cloud-4 absolute top-[40%] left-[30%] w-28 h-14 bg-white/20 rounded-full animate-float-slow"></div>
            </>
          )}
        </div>
      )}

      {/* Горы - начинаются с середины экрана, смещены левее */}
      <div className="mountains absolute top-1/2 left-0 w-full h-1/2 z-10">
        {/* Большие горы на заднем плане - смещены левее */}
        <div 
          className="mountain-bg-1 absolute top-0 left-[-5%] w-40 h-40 rotate-45 rounded-tl-[20px] transition-colors duration-1000"
          style={{ 
            backgroundColor: getMountainsColor(),
            opacity: 0.6,
            boxShadow: '0px 0px 80px 10px rgba(255, 255, 255, 0.1)'
          }}
        ></div>
        <div 
          className="mountain-bg-2 absolute top-[10%] left-[15%] w-48 h-48 rotate-45 rounded-tl-[25px] transition-colors duration-1000"
          style={{ 
            backgroundColor: getMountainsColor(),
            opacity: 0.7,
            boxShadow: '0px 0px 80px 10px rgba(255, 255, 255, 0.1)'
          }}
        ></div>
        <div 
          className="mountain-bg-3 absolute top-[5%] right-[20%] w-44 h-44 rotate-45 rounded-tl-[22px] transition-colors duration-1000"
          style={{ 
            backgroundColor: getMountainsColor(),
            opacity: 0.5,
            boxShadow: '0px 0px 80px 10px rgba(255, 255, 255, 0.1)'
          }}
        ></div>

        {/* Средние горы - смещены левее */}
        <div 
          className="mountain-mid-1 absolute top-[20%] left-[5%] w-32 h-32 rotate-45 rounded-tl-[15px] transition-colors duration-1000"
          style={{ 
            backgroundColor: getMountainsColor(),
            opacity: 0.8,
            boxShadow: '0px 0px 60px 8px rgba(255, 255, 255, 0.15)'
          }}
        ></div>
        <div 
          className="mountain-mid-2 absolute top-[25%] right-[30%] w-36 h-36 rotate-45 rounded-tl-[18px] transition-colors duration-1000"
          style={{ 
            backgroundColor: getMountainsColor(),
            opacity: 0.75,
            boxShadow: '0px 0px 60px 8px rgba(255, 255, 255, 0.15)'
          }}
        ></div>

        {/* Передние горы - смещены левее */}
        <div 
          className="mountain-1 absolute top-[40%] left-[-10px] w-28 h-28 rotate-45 rounded-tl-[12px] transition-colors duration-1000"
          style={{ 
            backgroundColor: getMountainsColor(),
            boxShadow: '0px 0px 50px 5px rgba(255, 255, 255, 0.2)'
          }}
        ></div>
        <div 
          className="mountain-2 absolute top-[50%] left-[-20px] w-20 h-20 rotate-45 rounded-tl-[10px] transition-colors duration-1000"
          style={{ 
            backgroundColor: getMountainsColor(),
            boxShadow: '0px 0px 50px 5px rgba(255, 255, 255, 0.2)'
          }}
        ></div>
        <div 
          className="mountain-3 absolute top-[45%] right-[15%] w-24 h-24 rotate-45 rounded-tl-[11px] transition-colors duration-1000"
          style={{ 
            backgroundColor: getMountainsColor(),
            boxShadow: '0px 0px 50px 5px rgba(255, 255, 255, 0.2)'
          }}
        ></div>

        {/* Холмы внизу */}
        <div 
          className="land-1 absolute bottom-0 left-0 w-[30%] h-20 rounded-tr-full transition-colors duration-1000"
          style={{ backgroundColor: getMountainsColor() }}
        ></div>
        <div 
          className="land-2 absolute bottom-0 left-[30%] w-[40%] h-16 rounded-t-full transition-colors duration-1000"
          style={{ backgroundColor: getMountainsColor() }}
        ></div>
        <div 
          className="land-3 absolute bottom-0 left-[70%] w-[30%] h-20 rounded-tl-full transition-colors duration-1000"
          style={{ backgroundColor: getMountainsColor() }}
        ></div>
      </div>

      {/* Световая база (солнце/луна) - фиксированный размер */}
      <div 
        className="light-base absolute top-[45%] left-1/2 transform -translate-x-1/2 rounded-full z-[1] transition-all duration-1000"
        style={{
          ...getLightBaseStyle()
        }}
      >
        {/* Кратеры на луне для ночного режима */}
        {effectiveTimeOfDay === 'night' && (
          <>
            <div className="absolute top-[20%] left-[15%] w-[10%] h-[10%] bg-gray-300 rounded-full opacity-80"></div>
            <div className="absolute top-[40%] left-[30%] w-[7%] h-[7%] bg-gray-300 rounded-full opacity-80"></div>
          </>
        )}
      </div>

      {/* Градиент для гор */}
      <div className="mountains-base absolute top-1/2 w-full h-1/2 z-20 transition-all duration-1000"
           style={{
             background: effectiveTimeOfDay === 'morning' || effectiveTimeOfDay === 'day' 
               ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(135, 206, 235, 0.3) 100%)'
               : effectiveTimeOfDay === 'night'
               ? 'linear-gradient(to bottom, rgba(4, 21, 36, 0) 0%, rgba(4, 21, 36, 1) 100%)'
               : 'linear-gradient(to bottom, rgba(45, 27, 105, 0) 0%, rgba(26, 11, 46, 1) 100%)'
           }}>
      </div>

      <style>{`
        .star {
          position: absolute;
          border-radius: 50%;
          background-color: white;
          opacity: 0.8;
        }

        .blink {
          animation: blink ease-in-out infinite;
        }

        @keyframes blink {
          50% {
            opacity: 0;
          }
        }

        .star-0 {
          height: 0.5px;
          width: 0.5px;
        }

        .star-1 {
          height: 1px;
          width: 1px;
        }

        .star-2 {
          height: 1.5px;
          width: 1.5px;
        }

        .star-3 {
          height: 2px;
          width: 2px;
        }

        .star-4 {
          height: 2.5px;
          width: 2.5px;
          box-shadow: 0px 0px 6px 1px rgba(255,255,255,0.5);
        }

        .blur {
          position: absolute;
          border-radius: 50%;
          background-color: white;
          opacity: 1;
          filter: blur(15px);
          width: 5px;
          height: 10px;
        }

        .shooting-star {
          animation: shooting-star 6s infinite;
        }

        @keyframes shooting-star {
          10% {
            transform: rotate(-30deg) translateX(-340px);
          }
          100% {
            transform: rotate(-30deg) translateX(-340px);
          }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          25% { transform: translateX(10px) translateY(-5px); }
          50% { transform: translateX(20px) translateY(0px); }
          75% { transform: translateX(10px) translateY(5px); }
        }

        @keyframes float-medium {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          33% { transform: translateX(-15px) translateY(-8px); }
          66% { transform: translateX(15px) translateY(8px); }
        }

        @keyframes float-fast {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(-25px) translateY(-10px); }
        }

        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float-medium 15s ease-in-out infinite;
        }

        .animate-float-fast {
          animation: float-fast 10s ease-in-out infinite;
        }

        @keyframes morningGradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes dayGradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes eveningGradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes nightGradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
}
