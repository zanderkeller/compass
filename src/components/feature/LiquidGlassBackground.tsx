import { useEffect, useState } from 'react';

type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

export default function LiquidGlassBackground() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 12) {
        setTimeOfDay('morning');
      } else if (hour >= 12 && hour < 17) {
        setTimeOfDay('day');
      } else if (hour >= 17 && hour < 21) {
        setTimeOfDay('evening');
      } else {
        setTimeOfDay('night');
      }
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const getBackgroundStyle = () => {
    switch (timeOfDay) {
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
          background: 'linear-gradient(135deg, #87CEEB 0%, #FFFFFF 100%)'
        };
    }
  };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={getBackgroundStyle()}>
      {/* Утро - восходящее солнце с облаками */}
      {timeOfDay === 'morning' && (
        <div className="absolute inset-0">
          {/* Восходящее солнце */}
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div 
              className="w-32 h-32 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #FFD700, #FFA500)',
                boxShadow: '0 0 80px 30px rgba(255, 215, 0, 0.4), 0 0 120px 50px rgba(255, 165, 0, 0.2)',
                animation: 'sunRise 6s ease-in-out infinite'
              }}
            />
          </div>

          {/* Облака */}
          <div className="absolute top-1/3 left-0 w-full h-1/3 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-70"
                style={{
                  width: `${100 + i * 50}px`,
                  height: `${50 + i * 20}px`,
                  top: `${20 + i * 15}%`,
                  left: `${i * 20}%`,
                  background: 'rgba(255, 255, 255, 0.8)',
                  filter: 'blur(8px)',
                  animation: `cloudFloat ${15 + i * 5}s linear infinite`,
                }}
              />
            ))}
          </div>

          {/* Летающие птицы */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute text-3xl"
                style={{
                  top: `${30 + i * 20}%`,
                  animation: `flyBird ${12 + i * 3}s linear infinite`,
                  animationDelay: `${i * 2}s`,
                }}
              >
                🕊️
              </div>
            ))}
          </div>

          {/* Холмы */}
          <div className="absolute bottom-0 left-0 w-full h-1/3">
            <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,100 Q300,20 600,100 T1200,100 L1200,200 L0,200 Z" fill="rgba(76, 175, 80, 0.3)" />
              <path d="M0,120 Q400,40 800,120 T1600,120 L1600,200 L0,200 Z" fill="rgba(56, 142, 60, 0.4)" />
            </svg>
          </div>
        </div>
      )}

      {/* День - яркое солнце с облаками */}
      {timeOfDay === 'day' && (
        <div className="absolute inset-0">
          {/* Яркое солнце */}
          <div className="absolute top-20 right-20">
            <div
              className="w-40 h-40 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #FFFF00, #FFD700)',
                boxShadow: '0 0 100px 40px rgba(255, 255, 0, 0.5), 0 0 150px 60px rgba(255, 215, 0, 0.3)',
                animation: 'sunPulse 3s ease-in-out infinite'
              }}
            />
          </div>

          {/* Облака */}
          <div className="absolute top-0 left-0 w-full h-2/3 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-50"
                style={{
                  width: `${120 + i * 40}px`,
                  height: `${60 + i * 20}px`,
                  top: `${10 + i * 10}%`,
                  left: `${i * 15}%`,
                  background: 'rgba(255, 255, 255, 0.7)',
                  filter: 'blur(12px)',
                  animation: `cloudDrift ${20 + i * 8}s linear infinite`,
                }}
              />
            ))}
          </div>

          {/* Деревья */}
          <div className="absolute bottom-0 left-0 w-full h-1/3">
            <svg viewBox="0 0 1200 300" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,200 L50,100 L100,200 M80,200 L130,80 L180,200 M160,200 L210,90 L260,200 M240,200 L290,70 L340,200 M320,200 L370,85 L420,200 M400,200 L450,95 L500,200 M480,200 L530,75 L580,200 M560,200 L610,90 L660,200 M640,200 L690,80 L740,200 M720,200 L770,100 L820,200 M800,200 L850,85 L900,200 M880,200 L930,95 L980,200 M960,200 L1010,70 L1060,200 M1040,200 L1090,90 L1140,200 M1120,200 L1170,80 L1220,200"
                    stroke="rgba(34, 139, 34, 0.6)" strokeWidth="8" fill="none" />
              <path d="M0,300 L1200,300" stroke="rgba(101, 67, 33, 0.5)" strokeWidth="20" />
            </svg>
          </div>
        </div>
      )}

      {/* Вечер - закат с городом */}
      {timeOfDay === 'evening' && (
        <div className="absolute inset-0">
          {/* Закатное солнце */}
          <div className="absolute bottom-1/4 right-1/4" style={{animation: 'sunsetMove 6s ease-in-out infinite'}}>
            <div
              className="w-48 h-48 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #FF6347, #FF4500)',
                boxShadow: '0 0 120px 50px rgba(255, 99, 71, 0.6), 0 0 180px 80px rgba(255, 69, 0, 0.3)',
              }}
            />
          </div>

          {/* Облака */}
          <div className="absolute top-0 left-0 w-full h-3/5 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-60"
                style={{
                  width: `${150 + i * 60}px`,
                  height: `${80 + i * 30}px`,
                  top: `${15 + i * 12}%`,
                  left: `${i * 20}%`,
                  background: i % 2 === 0 
                    ? 'linear-gradient(to right, rgba(255, 152, 0, 0.7), rgba(255, 193, 7, 0.5))'
                    : 'linear-gradient(to right, rgba(244, 67, 54, 0.6), rgba(255, 152, 0, 0.5))',
                  filter: 'blur(15px)',
                  animation: `cloudFloat ${18 + i * 6}s linear infinite`,
                }}
              />
            ))}
          </div>

          {/* Город силуэт */}
          <div className="absolute bottom-0 left-0 w-full h-2/5">
            <svg viewBox="0 0 1200 400" className="w-full h-full" preserveAspectRatio="none">
              {/* Здания */}
              <rect x="0" y="200" width="80" height="200" fill="rgba(20, 20, 40, 0.9)" />
              <rect x="90" y="150" width="100" height="250" fill="rgba(30, 30, 50, 0.9)" />
              <rect x="200" y="180" width="70" height="220" fill="rgba(20, 20, 40, 0.9)" />
              <rect x="280" y="120" width="110" height="280" fill="rgba(40, 40, 60, 0.9)" />
              <rect x="400" y="160" width="85" height="240" fill="rgba(25, 25, 45, 0.9)" />
              <rect x="495" y="140" width="95" height="260" fill="rgba(35, 35, 55, 0.9)" />
              <rect x="600" y="170" width="75" height="230" fill="rgba(20, 20, 40, 0.9)" />
              <rect x="685" y="130" width="105" height="270" fill="rgba(40, 40, 60, 0.9)" />
              <rect x="800" y="150" width="90" height="250" fill="rgba(30, 30, 50, 0.9)" />
              <rect x="900" y="110" width="120" height="290" fill="rgba(45, 45, 65, 0.9)" />
              <rect x="1030" y="160" width="80" height="240" fill="rgba(25, 25, 45, 0.9)" />
              <rect x="1120" y="140" width="80" height="260" fill="rgba(35, 35, 55, 0.9)" />

              {/* Окна в зданиях */}
              {[...Array(20)].map((_, i) => (
                <circle
                  key={i}
                  cx={50 + Math.random() * 1100}
                  cy={180 + Math.random() * 150}
                  r="3"
                  fill="rgba(255, 200, 50, 0.8)"
                  style={{
                    animation: `windowTwinkle ${2 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}

              {/* Луна */}
              <circle cx="1000" cy="80" r="60" fill="rgba(255, 240, 200, 0.9)" 
                      style={{filter: 'drop-shadow(0 0 30px rgba(255, 240, 200, 0.6))'}} />
            </svg>
          </div>

          {/* Летучие мыши */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl"
                style={{
                  top: `${40 + i * 15}%`,
                  animation: `flyBat ${10 + i * 2}s linear infinite`,
                  animationDelay: `${i * 1}s`,
                }}
              >
                🦇
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ночь - звезды и луна */}
      {timeOfDay === 'night' && (
        <div className="absolute inset-0">
          {/* Луна */}
          <div className="absolute top-20 right-20">
            <div
              className="w-40 h-40 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #FFFFFF, #E0E0E0)',
                boxShadow: '0 0 60px 20px rgba(255, 255, 255, 0.3), 0 0 100px 40px rgba(100, 150, 200, 0.2)',
              }}
            >
              {/* Кратеры луны */}
              <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-gray-400 opacity-60"></div>
              <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-gray-400 opacity-60"></div>
            </div>
          </div>

          {/* Звезды */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(80)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${1 + Math.random() * 2}px`,
                  height: `${1 + Math.random() * 2}px`,
                  top: `${Math.random() * 70}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0.5 + Math.random() * 0.5,
                  animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Падающие звезды */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: '40px',
                height: '2px',
                background: 'linear-gradient(to right, white, transparent)',
                top: `${20 + i * 30}%`,
                right: '-50px',
                animation: `shootingStar 4s ease-in infinite`,
                animationDelay: `${i * 2}s`,
              }}
            />
          ))}

          {/* Ночной город */}
          <div className="absolute bottom-0 left-0 w-full h-1/3">
            <svg viewBox="0 0 1200 300" className="w-full h-full" preserveAspectRatio="none">
              {/* Здания */}
              <rect x="0" y="100" width="100" height="200" fill="rgba(10, 10, 30, 0.95)" />
              <rect x="110" y="50" width="120" height="250" fill="rgba(15, 15, 35, 0.95)" />
              <rect x="240" y="80" width="90" height="220" fill="rgba(10, 10, 30, 0.95)" />
              <rect x="340" y="40" width="130" height="260" fill="rgba(20, 20, 40, 0.95)" />
              <rect x="480" y="90" width="100" height="210" fill="rgba(15, 15, 35, 0.95)" />
              <rect x="590" y="70" width="110" height="230" fill="rgba(18, 18, 38, 0.95)" />
              <rect x="710" y="60" width="95" height="240" fill="rgba(12, 12, 32, 0.95)" />
              <rect x="815" y="80" width="115" height="220" fill="rgba(20, 20, 40, 0.95)" />
              <rect x="940" y="50" width="130" height="250" fill="rgba(15, 15, 35, 0.95)" />
              <rect x="1080" y="90" width="100" height="210" fill="rgba(18, 18, 38, 0.95)" />

              {/* Окна в зданиях */}
              {[...Array(30)].map((_, i) => (
                <circle
                  key={i}
                  cx={50 + Math.random() * 1100}
                  cy={120 + Math.random() * 120}
                  r="2.5"
                  fill="rgba(255, 200, 100, 0.9)"
                  style={{
                    animation: `windowTwinkle ${1.5 + Math.random() * 2.5}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </svg>
          </div>
        </div>
      )}

      <style>{`
        @keyframes morningGradient {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.1); }
        }

        @keyframes dayGradient {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.15); }
        }

        @keyframes eveningGradient {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.1) saturate(1.2); }
        }

        @keyframes nightGradient {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.05); }
        }

        @keyframes sunRise {
          0%, 100% { transform: translateY(0px) translateX(-50%); }
          50% { transform: translateY(-30px) translateX(-50%); }
        }

        @keyframes sunPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes sunsetMove {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes cloudFloat {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100vw); }
        }

        @keyframes cloudDrift {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100vw); }
        }

        @keyframes flyBird {
          0% { left: -50px; }
          100% { left: 100vw; }
        }

        @keyframes flyBat {
          0% { left: -50px; }
          100% { left: 100vw; }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes shootingStar {
          0% { transform: translateX(0) translateY(0); opacity: 1; }
          100% { transform: translateX(400px) translateY(400px); opacity: 0; }
        }

        @keyframes windowTwinkle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

