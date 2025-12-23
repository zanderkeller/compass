import { useMemo, useEffect, useState } from 'react';
import morningBg from '@/assets/bg/morning.png';
import dayBg from '@/assets/bg/day.png';
import eveningBg from '@/assets/bg/evening.png';
import nightBg from '@/assets/bg/night.png';

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

export function getTimeOfDay(date = new Date()): TimeOfDay {
  const h = date.getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'day';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

// Floating clouds for morning/day
function FloatingClouds() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Cloud 1 */}
      <div 
        className="absolute w-32 h-16 bg-white/30 rounded-full blur-xl animate-cloud-float-1"
        style={{ top: '8%', left: '-10%' }}
      />
      {/* Cloud 2 */}
      <div 
        className="absolute w-48 h-20 bg-white/25 rounded-full blur-2xl animate-cloud-float-2"
        style={{ top: '15%', left: '-15%' }}
      />
      {/* Cloud 3 */}
      <div 
        className="absolute w-40 h-14 bg-white/20 rounded-full blur-xl animate-cloud-float-3"
        style={{ top: '22%', left: '-12%' }}
      />
    </div>
  );
}

// Twinkling stars for night
function TwinklingStars() {
  const stars = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 60}%`,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-star-twinkle"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// Shooting star for night
function ShootingStars() {
  const [shootingStars, setShootingStars] = useState<Array<{ id: number; left: number; top: number }>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newStar = {
          id: Date.now(),
          left: Math.random() * 80 + 10,
          top: Math.random() * 30 + 5,
        };
        setShootingStars((prev) => [...prev, newStar]);
        setTimeout(() => {
          setShootingStars((prev) => prev.filter((s) => s.id !== newStar.id));
        }, 1000);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="absolute w-1 h-1 bg-white rounded-full animate-shooting-star"
          style={{ left: `${star.left}%`, top: `${star.top}%` }}
        >
          <div className="absolute w-20 h-[1px] bg-gradient-to-l from-white to-transparent -translate-x-full" />
        </div>
      ))}
    </div>
  );
}

// Glowing moon for night/evening
function GlowingMoon({ isEvening }: { isEvening?: boolean }) {
  return (
    <div 
      className={`absolute ${isEvening ? 'w-24 h-24 top-[12%] right-[15%]' : 'w-16 h-16 top-[18%] left-[20%]'}`}
    >
      <div className={`absolute inset-0 rounded-full ${isEvening ? 'bg-orange-200' : 'bg-yellow-100'} animate-moon-glow`}>
        <div className={`absolute inset-0 rounded-full blur-xl ${isEvening ? 'bg-orange-300/50' : 'bg-yellow-200/40'}`} />
        <div className={`absolute inset-0 rounded-full blur-2xl ${isEvening ? 'bg-orange-400/30' : 'bg-yellow-300/30'} animate-moon-pulse`} />
      </div>
    </div>
  );
}

// Fireflies for evening/night
function Fireflies() {
  const fireflies = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${50 + Math.random() * 45}%`,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 4,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {fireflies.map((fly) => (
        <div
          key={fly.id}
          className="absolute w-2 h-2 rounded-full bg-yellow-300/80 animate-firefly"
          style={{
            left: fly.left,
            top: fly.top,
            animationDelay: `${fly.delay}s`,
            animationDuration: `${fly.duration}s`,
            boxShadow: '0 0 8px 2px rgba(253, 224, 71, 0.6)',
          }}
        />
      ))}
    </div>
  );
}

// Sun rays for morning/day
function SunRays({ isMorning }: { isMorning?: boolean }) {
  return (
    <div 
      className={`absolute ${isMorning ? 'top-[5%] left-1/2 -translate-x-1/2' : 'top-[8%] right-[20%]'}`}
    >
      <div className="relative">
        <div className={`w-20 h-20 rounded-full ${isMorning ? 'bg-gradient-to-b from-yellow-200 to-orange-300' : 'bg-gradient-to-b from-yellow-100 to-yellow-300'} animate-sun-pulse`}>
          <div className="absolute inset-0 rounded-full blur-2xl bg-yellow-200/50" />
        </div>
        {/* Sun rays */}
        <div className="absolute inset-0 animate-sun-rays">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-32 bg-gradient-to-b from-yellow-200/40 to-transparent origin-bottom"
              style={{
                left: '50%',
                bottom: '50%',
                transform: `translateX(-50%) rotate(${i * 45}deg)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Water reflection animation
function WaterReflection() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-1/3 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 animate-water-shimmer">
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/10 animate-water-wave" />
      </div>
    </div>
  );
}

// Fog/mist effect
function MistEffect({ intensity = 'light' }: { intensity?: 'light' | 'medium' | 'heavy' }) {
  const opacity = intensity === 'heavy' ? '0.3' : intensity === 'medium' ? '0.2' : '0.1';
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute w-full h-1/3 bottom-1/4 animate-mist-float"
        style={{ opacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent blur-3xl" />
      </div>
    </div>
  );
}

interface BackgroundLayerProps {
  timeOfDay: TimeOfDay;
}

export function BackgroundLayer({ timeOfDay }: BackgroundLayerProps) {
  const bgSrc = useMemo(() => {
    switch (timeOfDay) {
      case 'morning': return morningBg;
      case 'day': return dayBg;
      case 'evening': return eveningBg;
      case 'night': return nightBg;
    }
  }, [timeOfDay]);

  return (
    <div
      className="fixed inset-0 -z-10 transition-opacity duration-1000"
      style={{ pointerEvents: 'none', contain: 'paint' }}
      aria-hidden
    >
      {/* Base background image with subtle zoom animation */}
      <div className="absolute inset-0 animate-bg-breathe">
        <img 
          src={bgSrc} 
          alt="" 
          className="h-full w-full object-cover transition-opacity duration-1000" 
          draggable={false} 
        />
      </div>

      {/* Time-specific effects */}
      {timeOfDay === 'morning' && (
        <>
          <SunRays isMorning />
          <FloatingClouds />
          <MistEffect intensity="medium" />
          <WaterReflection />
          {/* Warm morning overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-orange-200/10 via-transparent to-pink-200/10 animate-gradient-shift" />
        </>
      )}

      {timeOfDay === 'day' && (
        <>
          <SunRays />
          <FloatingClouds />
          <WaterReflection />
          {/* Bright day overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-100/10 via-transparent to-cyan-100/10" />
        </>
      )}

      {timeOfDay === 'evening' && (
        <>
          <GlowingMoon isEvening />
          <Fireflies />
          <MistEffect intensity="heavy" />
          {/* Warm sunset overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-orange-400/15 via-pink-500/10 to-purple-900/20 animate-gradient-shift" />
        </>
      )}

      {timeOfDay === 'night' && (
        <>
          <TwinklingStars />
          <ShootingStars />
          <GlowingMoon />
          <Fireflies />
          {/* Night ambient glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-indigo-900/30" />
          {/* Aurora effect */}
          <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 animate-aurora" />
          </div>
        </>
      )}

      {/* Universal vignette for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/30" />
    </div>
  );
}

export default BackgroundLayer;
