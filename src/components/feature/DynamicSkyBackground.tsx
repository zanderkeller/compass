import { useEffect, useState, useMemo } from "react";

// === Types ===
type TimeOfDay = "night" | "dawn" | "morning" | "day" | "evening" | "dusk";

interface SkyColors {
  top: string;
  mid: string;
  bottom: string;
}

interface CelestialPosition {
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

// === Helpers ===
function getTimeProgress(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 6.5) return "dawn";
  if (hour >= 6.5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "day";
  if (hour >= 17 && hour < 18.5) return "dusk";
  if (hour >= 18.5 && hour < 21) return "evening";
  return "night";
}

// Moon phase calculation (0 = new moon, 0.5 = full moon)
function getMoonPhase(date = new Date()): number {
  const LUNAR_CYCLE = 29.53059;
  const KNOWN_NEW_MOON = new Date("2024-01-11T11:57:00Z").getTime();
  const diff = date.getTime() - KNOWN_NEW_MOON;
  const days = diff / (1000 * 60 * 60 * 24);
  const phase = (days % LUNAR_CYCLE) / LUNAR_CYCLE;
  return phase < 0 ? phase + 1 : phase;
}

// Interpolate between colors
function lerpColor(c1: string, c2: string, t: number): string {
  const hex = (c: string) => c.replace("#", "");
  const r1 = parseInt(hex(c1).slice(0, 2), 16);
  const g1 = parseInt(hex(c1).slice(2, 4), 16);
  const b1 = parseInt(hex(c1).slice(4, 6), 16);
  const r2 = parseInt(hex(c2).slice(0, 2), 16);
  const g2 = parseInt(hex(c2).slice(2, 4), 16);
  const b2 = parseInt(hex(c2).slice(4, 6), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// === Sky Palettes ===
const skyPalettes: Record<TimeOfDay, SkyColors> = {
  night: { top: "#05070a", mid: "#0b112b", bottom: "#0f1a3d" },
  dawn: { top: "#1a1a3e", mid: "#4a3060", bottom: "#ff9a5c" },
  morning: { top: "#87ceeb", mid: "#ffd89b", bottom: "#ffb347" },
  day: { top: "#00c6ff", mid: "#48b1bf", bottom: "#87ceeb" },
  dusk: { top: "#2c3e50", mid: "#fd746c", bottom: "#ff9a5c" },
  evening: { top: "#141e30", mid: "#243b55", bottom: "#4a3060" },
};

// === Celestial Body Positions ===
function getSunPosition(hour: number): CelestialPosition {
  // Sun rises at 6, peaks at 12, sets at 18
  if (hour < 5 || hour > 19) {
    return { x: 50, y: 120, opacity: 0, scale: 1 };
  }

  const dayProgress = (hour - 5) / 14; // 5am to 7pm = 14 hours
  const x = 10 + dayProgress * 80; // Left to right
  const y = 80 - Math.sin(dayProgress * Math.PI) * 70; // Arc motion
  const opacity = hour >= 6 && hour <= 18 ? 1 : Math.max(0, 1 - Math.abs(hour < 12 ? 6 - hour : hour - 18));

  return { x, y, opacity: Math.min(1, opacity), scale: 1 };
}

function getMoonPosition(hour: number): CelestialPosition {
  // Moon rises at 18, peaks at 0, sets at 6
  let nightProgress: number;

  if (hour >= 18) {
    nightProgress = (hour - 18) / 12;
  } else if (hour < 6) {
    nightProgress = (hour + 6) / 12;
  } else {
    return { x: 50, y: 120, opacity: 0, scale: 1 };
  }

  const x = 10 + nightProgress * 80;
  const y = 80 - Math.sin(nightProgress * Math.PI) * 60;
  const opacity = hour >= 19 || hour <= 5 ? 1 : Math.max(0, 1 - Math.abs(hour < 12 ? hour - 5 : 19 - hour));

  return { x, y, opacity: Math.min(1, opacity), scale: 1 };
}

// === Stars Component ===
function Stars({ opacity }: { opacity: number }) {
  const stars = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      top: Math.random() * 50,
      left: Math.random() * 100,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 2,
    }));
  }, []);

  if (opacity <= 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity }}>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white star-twinkle"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            boxShadow: "0 0 4px rgba(255,255,255,0.8)",
          }}
        />
      ))}
    </div>
  );
}

// === Sun Component ===
function Sun({ position }: { position: CelestialPosition }) {
  if (position.opacity <= 0) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        opacity: position.opacity,
        transition: "all 2s ease-out",
      }}
    >
      {/* Outer glow */}
      <div
        className="absolute rounded-full sun-glow-pulse"
        style={{
          width: 200,
          height: 200,
          left: -100,
          top: -100,
          background: "radial-gradient(circle, rgba(255,220,100,0.4) 0%, rgba(255,180,50,0.1) 50%, transparent 70%)",
        }}
      />
      {/* Middle glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 120,
          height: 120,
          left: -60,
          top: -60,
          background: "radial-gradient(circle, rgba(255,200,80,0.6) 0%, rgba(255,160,50,0.2) 60%, transparent 80%)",
        }}
      />
      {/* Sun core */}
      <div
        className="rounded-full sun-pulse"
        style={{
          width: 60,
          height: 60,
          background: "radial-gradient(circle at 30% 30%, #fff5cc, #ffd54f 40%, #ffb300 80%, #ff8f00)",
          boxShadow: "0 0 40px rgba(255,180,50,0.8), 0 0 80px rgba(255,150,50,0.4)",
        }}
      />
    </div>
  );
}

// === Moon Component with Phases ===
function Moon({ position, phase }: { position: CelestialPosition; phase: number }) {
  if (position.opacity <= 0) return null;

  // Calculate shadow position based on phase
  // phase 0 = new moon (fully shadowed), 0.5 = full moon (no shadow)
  const shadowOffset =
    phase <= 0.5
      ? (0.5 - phase) * 200 // Waxing: shadow moves right to left
      : (phase - 0.5) * -200; // Waning: shadow moves left to right

  const isWaxing = phase < 0.5;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        opacity: position.opacity,
        transition: "all 2s ease-out",
      }}
    >
      {/* Moon glow */}
      <div
        className="absolute rounded-full moon-glow-pulse"
        style={{
          width: 160,
          height: 160,
          left: -80,
          top: -80,
          background: "radial-gradient(circle, rgba(144,164,255,0.25) 0%, rgba(99,102,241,0) 70%)",
        }}
      />

      {/* Moon body container */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: 70,
          height: 70,
          background: "#fdfcf0",
          boxShadow: "inset -10px -10px 30px rgba(0,0,0,0.1), 0 0 30px rgba(200,220,255,0.4)",
        }}
      >
        {/* Craters */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
          <circle cx="25" cy="30" r="8" fill="currentColor" />
          <circle cx="65" cy="35" r="11" fill="currentColor" />
          <circle cx="45" cy="70" r="9" fill="currentColor" />
          <circle cx="20" cy="65" r="5" fill="currentColor" />
          <circle cx="78" cy="60" r="7" fill="currentColor" />
          <circle cx="55" cy="20" r="4" fill="currentColor" />
        </svg>

        {/* Phase shadow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "#05070a",
            transform: `translateX(${shadowOffset}%)`,
            transition: "transform 1s ease-in-out",
          }}
        />
      </div>

      {/* Phase indicator */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/60 whitespace-nowrap"
        style={{ textShadow: "0 0 4px rgba(0,0,0,0.8)" }}
      >
        {isWaxing ? "☽" : "☾"}
      </div>
    </div>
  );
}

// === Mountains Silhouette ===
function Mountains({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  const isNight = timeOfDay === "night" || timeOfDay === "evening" || timeOfDay === "dusk";
  const baseColor = isNight ? "#05081a" : "#1a3a2a";
  const midColor = isNight ? "#080c20" : "#2d4a3a";
  const frontColor = isNight ? "#02040a" : "#0d1f15";

  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: "65%" }}>
      {/* Back mountains */}
      <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1320 1500">
        <path
          d="M0,1500 L0,800 C300,600 500,900 800,700 C1100,500 1320,800 1320,800 L1320,1500 Z"
          fill={baseColor}
          opacity="0.3"
        />
      </svg>

      {/* Mid mountains */}
      <svg
        className="absolute bottom-0 w-full"
        style={{ height: "75%" }}
        preserveAspectRatio="none"
        viewBox="0 0 1320 1200"
      >
        <path
          d="M0,1200 L0,500 C200,400 600,700 800,500 C1000,300 1320,600 1320,600 L1320,1200 Z"
          fill={midColor}
          opacity="0.6"
        />
      </svg>

      {/* Front mountains with trees */}
      <svg
        className="absolute bottom-0 w-full"
        style={{ height: "50%" }}
        preserveAspectRatio="none"
        viewBox="0 0 1320 800"
      >
        <path d="M0,800 L0,300 C400,200 900,400 1320,250 L1320,800 Z" fill={frontColor} />
      </svg>

      {/* Trees */}
      <div className="absolute bottom-[22%] left-[12%]" style={{ width: 32, height: 64 }}>
        <svg className="w-full h-full" viewBox="0 0 100 200">
          <path d="M50,0 C20,80 20,120 50,180 C80,120 80,80 50,0 Z" fill={frontColor} />
        </svg>
      </div>
      <div className="absolute bottom-[16%] left-[28%] scale-x-[-1]" style={{ width: 24, height: 48, opacity: 0.9 }}>
        <svg className="w-full h-full" viewBox="0 0 100 200">
          <path d="M50,0 C20,80 20,120 50,180 C80,120 80,80 50,0 Z" fill={frontColor} />
        </svg>
      </div>
      <div className="absolute bottom-[19%] right-[18%]" style={{ width: 40, height: 80 }}>
        <svg className="w-full h-full" viewBox="0 0 100 200">
          <path d="M50,0 C20,80 20,120 50,180 C80,120 80,80 50,0 Z" fill={frontColor} />
        </svg>
      </div>

      {/* Bottom gradient overlay */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "40%",
          background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
        }}
      />
    </div>
  );
}

// === Main Component ===
export default function DynamicSkyBackground() {
  const [hour, setHour] = useState(getTimeProgress);
  const [moonPhase, setMoonPhase] = useState(getMoonPhase);

  useEffect(() => {
    const updateTime = () => {
      setHour(getTimeProgress());
      setMoonPhase(getMoonPhase());
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const timeOfDay = getTimeOfDay(hour);
  const nextTimeOfDay = getTimeOfDay(hour + 1);

  // Calculate transition progress between time periods
  const transitionProgress = useMemo(() => {
    const transitionPoints = [5, 6.5, 11, 17, 18.5, 21];
    for (let i = 0; i < transitionPoints.length; i++) {
      const start = transitionPoints[i];
      const end = transitionPoints[(i + 1) % transitionPoints.length];
      if (hour >= start && hour < end) {
        const duration = end > start ? end - start : 24 - start + end;
        const progress = hour >= start ? (hour - start) / duration : 0;
        return Math.min(1, progress * 2); // Faster transition at edges
      }
    }
    return 0;
  }, [hour]);

  // Interpolated sky colors
  const skyColors = useMemo(() => {
    const current = skyPalettes[timeOfDay];
    const next = skyPalettes[nextTimeOfDay];
    const t = transitionProgress;

    return {
      top: lerpColor(current.top, next.top, t),
      mid: lerpColor(current.mid, next.mid, t),
      bottom: lerpColor(current.bottom, next.bottom, t),
    };
  }, [timeOfDay, nextTimeOfDay, transitionProgress]);

  const sunPosition = getSunPosition(hour);
  const moonPosition = getMoonPosition(hour);

  // Stars visibility (fade in at dusk, fade out at dawn)
  const starsOpacity = useMemo(() => {
    if (hour >= 21 || hour < 5) return 1;
    if (hour >= 19) return (hour - 19) / 2;
    if (hour < 7) return 1 - (hour - 5) / 2;
    return 0;
  }, [hour]);

  return (
    <>
      <div className="fixed inset-0 -z-20 overflow-hidden" style={{ pointerEvents: "none" }} aria-hidden>
        {/* Sky gradient */}
        <div
          className="absolute inset-0 transition-colors duration-[3000ms]"
          style={{
            background: `linear-gradient(180deg, ${skyColors.top} 0%, ${skyColors.mid} 50%, ${skyColors.bottom} 100%)`,
          }}
        />

        {/* Stars */}
        <Stars opacity={starsOpacity} />

        {/* Celestial bodies */}
        <Sun position={sunPosition} />
        <Moon position={moonPosition} phase={moonPhase} />

        {/* Mountains */}
        <Mountains timeOfDay={timeOfDay} />

        {/* Bottom blur gradient */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/3"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${skyColors.top}90 60%, ${skyColors.top} 100%)`,
            backdropFilter: "blur(2px)",
          }}
        />
      </div>

      <style>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .star-twinkle {
          animation: starTwinkle 4s ease-in-out infinite;
        }
        
        @keyframes sunPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .sun-pulse {
          animation: sunPulse 4s ease-in-out infinite;
        }
        
        @keyframes sunGlowPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        .sun-glow-pulse {
          animation: sunGlowPulse 6s ease-in-out infinite;
        }
        
        @keyframes moonGlowPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
        .moon-glow-pulse {
          animation: moonGlowPulse 8s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
