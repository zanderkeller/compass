
import { useState, useEffect } from 'react';
import GlassCard from '../base/GlassCard';

interface WeatherData {
  temperature: number;
  condition: string;
  city: string;
  icon: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Показываем данные по умолчанию без запроса геолокации
    const getWeather = async () => {
      try {
        // Используем статичные данные без геолокации
        setTimeout(() => {
          setWeather({
            temperature: 23,
            condition: 'Ясно',
            city: 'Москва',
            icon: 'ri-sun-line'
          });
          setLoading(false);
        }, 1000);

      } catch (error) {
        setWeather({
          temperature: 23,
          condition: 'Ясно',
          city: 'Москва',
          icon: 'ri-sun-line'
        });
        setLoading(false);
      }
    };

    getWeather();
  }, []);

  if (loading) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-white/10 rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-white/10 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (!weather) return null;

  return (
    <GlassCard className="p-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
          <i className={`${weather.icon} text-white text-xl`}></i>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-white text-lg font-semibold">{weather.city}</span>
            <span className="text-cyan-400 text-lg font-bold">+{weather.temperature}°</span>
          </div>
          <p className="text-white/70 text-sm">{weather.condition}</p>
        </div>
      </div>
    </GlassCard>
  );
}
