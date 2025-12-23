
import { useState, useEffect } from 'react';
import GlassCard from '../base/GlassCard';
import { dbManager, getTelegramUserId, type EmotionEntry } from '../../utils/database';

export default function EmotionChart() {
  const [chartData, setChartData] = useState<EmotionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      await dbManager.init();
      const telegramId = getTelegramUserId();
      // Загружаем данные за последние 7 дней
      const entries = await dbManager.getEmotionEntriesByTelegramId(telegramId, 7);
      
      // Фильтруем только данные за последние 7 дней
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const filteredEntries = entries.filter(entry => 
        new Date(entry.date) >= sevenDaysAgo
      );
      
      console.log('Загружено записей эмоций:', filteredEntries.length);
      setChartData(filteredEntries);
    } catch (error) {
      console.error('Ошибка загрузки данных графика:', error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Получаем дни недели с понедельника
  const getWeekDays = () => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const today = new Date();
    const weekDays = [];
    
    // Находим понедельник текущей недели
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + mondayOffset + i);
      weekDays.push({
        date: date.toISOString().split('T')[0],
        label: days[i]
      });
    }
    
    return weekDays;
  };

  if (loading) {
    return (
      <GlassCard className="p-4">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-white/60 text-xs">Загрузка...</p>
        </div>
      </GlassCard>
    );
  }

  // Группируем данные по дням недели с понедельника
  const weekDays = getWeekDays();
  const groupedData = chartData.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = {};
    }
    acc[date][entry.type] = entry;
    return acc;
  }, {} as Record<string, Record<string, EmotionEntry>>);

  const maxLevel = 10;

  // Проверяем есть ли данные для отображения
  const hasData = chartData.length > 0;

  if (!hasData) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-base font-semibold">График эмоций</h3>
          <i className="ri-line-chart-line text-cyan-400 text-lg"></i>
        </div>
        
        <div className="text-center py-8">
          <i className="ri-emotion-line text-white/30 text-4xl mb-3"></i>
          <p className="text-white/60 text-sm mb-2">Нет данных для графика</p>
          <p className="text-white/40 text-xs">Начните делать ежедневные чек-ины</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-base font-semibold">График эмоций за неделю</h3>
        <i className="ri-line-chart-line text-cyan-400 text-lg"></i>
      </div>

      {/* Красивый градиентный график */}
      <div className="relative h-40 mb-6 ml-6">
        {/* Левая шкала значений */}
        <div className="absolute -left-6 top-0 h-full flex flex-col justify-between text-white/40 text-xs">
          <span>10</span>
          <span>8</span>
          <span>6</span>
          <span>4</span>
          <span>2</span>
          <span>0</span>
        </div>

        {/* Горизонтальные линии сетки */}
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="absolute w-full border-t border-white/5"
            style={{ top: `${(i * 20)}%` }}
          ></div>
        ))}

        {/* SVG для линий и градиентов */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Определяем градиенты */}
          <defs>
            <linearGradient id="morningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1"/>
            </linearGradient>
            <linearGradient id="eveningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Утренняя область под линией */}
          <path
            fill="url(#morningGradient)"
            d={`M 0,100 ${weekDays.map((day, index) => {
              const dayData = groupedData[day.date] || {};
              const morningEntry = dayData.morning;
              const level = morningEntry ? morningEntry.level : 0;
              const x = (index / (weekDays.length - 1)) * 100;
              const y = 100 - (level / maxLevel) * 100;
              return `L ${x},${y}`;
            }).join(' ')} L 100,100 Z`}
          />
          
          {/* Вечерняя область под линией */}
          <path
            fill="url(#eveningGradient)"
            d={`M 0,100 ${weekDays.map((day, index) => {
              const dayData = groupedData[day.date] || {};
              const eveningEntry = dayData.evening;
              const level = eveningEntry ? eveningEntry.level : 0;
              const x = (index / (weekDays.length - 1)) * 100;
              const y = 100 - (level / maxLevel) * 100;
              return `L ${x},${y}`;
            }).join(' ')} L 100,100 Z`}
            opacity="0.6"
          />
          
          {/* Утренняя линия с свечением */}
          <path
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1.5"
            filter="url(#glow)"
            d={`M ${weekDays.map((day, index) => {
              const dayData = groupedData[day.date] || {};
              const morningEntry = dayData.morning;
              const level = morningEntry ? morningEntry.level : 0;
              const x = (index / (weekDays.length - 1)) * 100;
              const y = 100 - (level / maxLevel) * 100;
              return `${index === 0 ? '' : 'L'} ${x},${y}`;
            }).join(' ')}`}
          />
          
          {/* Вечерняя линия с свечением */}
          <path
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="1.5"
            strokeDasharray="3,3"
            filter="url(#glow)"
            d={`M ${weekDays.map((day, index) => {
              const dayData = groupedData[day.date] || {};
              const eveningEntry = dayData.evening;
              const level = eveningEntry ? eveningEntry.level : 0;
              const x = (index / (weekDays.length - 1)) * 100;
              const y = 100 - (level / maxLevel) * 100;
              return `${index === 0 ? '' : 'L'} ${x},${y}`;
            }).join(' ')}`}
          />
          
          {/* Светящиеся точки для утренних записей */}
          {weekDays.map((day, index) => {
            const dayData = groupedData[day.date] || {};
            const morningEntry = dayData.morning;
            if (!morningEntry) return null;
            
            const x = (index / (weekDays.length - 1)) * 100;
            const y = 100 - (morningEntry.level / maxLevel) * 100;
            
            return (
              <g key={`morning-${index}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#06b6d4"
                  filter="url(#glow)"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="#ffffff"
                />
              </g>
            );
          })}
          
          {/* Светящиеся точки для вечерних записей */}
          {weekDays.map((day, index) => {
            const dayData = groupedData[day.date] || {};
            const eveningEntry = dayData.evening;
            if (!eveningEntry) return null;
            
            const x = (index / (weekDays.length - 1)) * 100;
            const y = 100 - (eveningEntry.level / maxLevel) * 100;
            
            return (
              <g key={`evening-${index}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#8b5cf6"
                  filter="url(#glow)"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="#ffffff"
                />
              </g>
            );
          })}
        </svg>

        {/* Подписи дней недели */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between">
          {weekDays.map((day, index) => (
            <div key={`day-${index}`} className="text-white/60 text-xs text-center">
              {day.label}
            </div>
          ))}
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-3 text-center mb-4">
        <div>
          <div className="text-cyan-400 text-base font-bold">
            {Math.round(chartData.reduce((sum, entry) => sum + entry.level, 0) / chartData.length)}
          </div>
          <div className="text-white/60 text-xs">Средний</div>
        </div>
        <div>
          <div className="text-purple-400 text-base font-bold">{chartData.length}</div>
          <div className="text-white/60 text-xs">Записей</div>
        </div>
      </div>

      {/* Легенда внизу */}
      <div className="flex items-center justify-center space-x-6 text-xs pt-3 border-t border-white/10">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-full"></div>
          <span className="text-white/70">Утро</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-gradient-to-r from-purple-400 to-purple-300 rounded-full opacity-80" style={{backgroundImage: 'repeating-linear-gradient(90deg, #8b5cf6 0px, #8b5cf6 3px, transparent 3px, transparent 6px)'}}></div>
          <span className="text-white/70">Вечер</span>
        </div>
      </div>
    </GlassCard>
  );
}
