import { useState, useEffect } from 'react';
import GlassCard from '../base/GlassCard';
import { dbManager, getTelegramUserId, type EmotionEntry } from '../../utils/database';

type ChartPeriod = 'week' | 'month';
type ChartStyle = 'line' | 'bars' | 'area';
type ChartColor = 'cyan' | 'purple' | 'pink' | 'green';

interface ChartSettings {
  period: ChartPeriod;
  style: ChartStyle;
  color: ChartColor;
}

const colorSchemes = {
  cyan: { morning: '#06b6d4', evening: '#0891b2', glow: 'rgba(6, 182, 212, 0.8)' },
  purple: { morning: '#8b5cf6', evening: '#7c3aed', glow: 'rgba(139, 92, 246, 0.8)' },
  pink: { morning: '#ec4899', evening: '#db2777', glow: 'rgba(236, 72, 153, 0.8)' },
  green: { morning: '#10b981', evening: '#059669', glow: 'rgba(16, 185, 129, 0.8)' },
};

export default function EmotionChart() {
  const [chartData, setChartData] = useState<EmotionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ChartSettings>({
    period: 'week',
    style: 'area',
    color: 'cyan'
  });

  useEffect(() => {
    loadChartData();
  }, [settings.period]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      await dbManager.init();
      const telegramId = getTelegramUserId();
      const days = settings.period === 'week' ? 7 : 30;
      const entries = await dbManager.getEmotionEntriesByTelegramId(telegramId, days * 2);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const filteredEntries = entries.filter(entry =>
        new Date(entry.date) >= cutoffDate
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

  const getDays = () => {
    const daysCount = settings.period === 'week' ? 7 : 30;
    const labels = settings.period === 'week' 
      ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
      : Array.from({ length: 30 }, (_, i) => String(i + 1));
    
    const today = new Date();
    const result = [];

    if (settings.period === 'week') {
      const currentDay = today.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + mondayOffset + i);
        result.push({
          date: date.toISOString().split('T')[0],
          label: labels[i]
        });
      }
    } else {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        result.push({
          date: date.toISOString().split('T')[0],
          label: String(date.getDate())
        });
      }
    }

    return result;
  };

  const colors = colorSchemes[settings.color];

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-white/60 text-xs">Загрузка...</p>
        </div>
      </div>
    );
  }

  const days = getDays();
  const groupedData = chartData.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = {};
    }
    acc[date][entry.type] = entry;
    return acc;
  }, {} as Record<string, Record<string, EmotionEntry>>);

  const maxLevel = 10;
  const hasData = chartData.length > 0;

  if (!hasData) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-base font-semibold">График эмоций</h3>
          <i className="ri-line-chart-line text-cyan-400 text-lg"></i>
        </div>

        <div className="text-center py-8">
          <i className="ri-emotion-line text-white/30 text-4xl mb-3"></i>
          <p className="text-white/60 text-sm mb-2">Нет данных для графика</p>
          <p className="text-white/40 text-xs">Начните делать ежедневные чек-ины</p>
        </div>
      </div>
    );
  }

  const displayDays = settings.period === 'week' ? days : days.filter((_, i) => i % 3 === 0 || i === days.length - 1);

  return (
    <div className="p-4">
      {/* Заголовок с настройками */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-base font-semibold">
          График эмоций за {settings.period === 'week' ? 'неделю' : 'месяц'}
        </h3>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
        >
          <i className={`ri-${showSettings ? 'close' : 'settings-3'}-line text-cyan-400`}></i>
        </button>
      </div>

      {/* Настройки */}
      {showSettings && (
        <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
          {/* Период */}
          <div>
            <label className="text-white/50 text-xs mb-2 block">Период</label>
            <div className="flex gap-2">
              {(['week', 'month'] as ChartPeriod[]).map(period => (
                <button
                  key={period}
                  onClick={() => setSettings(s => ({ ...s, period }))}
                  className={`flex-1 py-2 rounded-lg text-xs transition-all ${
                    settings.period === period
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {period === 'week' ? 'Неделя' : 'Месяц'}
                </button>
              ))}
            </div>
          </div>

          {/* Стиль */}
          <div>
            <label className="text-white/50 text-xs mb-2 block">Стиль</label>
            <div className="flex gap-2">
              {([
                { value: 'line', icon: 'ri-line-chart-line', label: 'Линия' },
                { value: 'area', icon: 'ri-bar-chart-grouped-line', label: 'Область' },
                { value: 'bars', icon: 'ri-bar-chart-line', label: 'Столбцы' },
              ] as const).map(style => (
                <button
                  key={style.value}
                  onClick={() => setSettings(s => ({ ...s, style: style.value }))}
                  className={`flex-1 py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 ${
                    settings.style === style.value
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  <i className={style.icon}></i>
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Цвет */}
          <div>
            <label className="text-white/50 text-xs mb-2 block">Цвет</label>
            <div className="flex gap-2">
              {(['cyan', 'purple', 'pink', 'green'] as ChartColor[]).map(color => (
                <button
                  key={color}
                  onClick={() => setSettings(s => ({ ...s, color }))}
                  className={`w-8 h-8 rounded-full transition-all ${
                    settings.color === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                  }`}
                  style={{ 
                    backgroundColor: colorSchemes[color].morning,
                    boxShadow: settings.color === color ? `0 0 20px ${colorSchemes[color].glow}` : undefined
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* График с неоновым свечением */}
      <div className="relative h-40 mb-6 ml-6">
        {/* Неоновое свечение под графиком */}
        <div 
          className="absolute inset-0 blur-xl opacity-30"
          style={{
            background: `radial-gradient(ellipse at 50% 100%, ${colors.glow} 0%, transparent 70%)`
          }}
        />

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

        {/* SVG для графика */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`morningGrad-${settings.color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.morning} stopOpacity="0.8"/>
              <stop offset="100%" stopColor={colors.morning} stopOpacity="0.1"/>
            </linearGradient>
            <linearGradient id={`eveningGrad-${settings.color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.evening} stopOpacity="0.6"/>
              <stop offset="100%" stopColor={colors.evening} stopOpacity="0.05"/>
            </linearGradient>
            <filter id="neonGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Область/Столбцы */}
          {settings.style === 'area' && (
            <>
              <path
                fill={`url(#morningGrad-${settings.color})`}
                d={`M 0,100 ${days.map((day, index) => {
                  const dayData = groupedData[day.date] || {};
                  const level = dayData.morning?.level || 0;
                  const x = (index / (days.length - 1)) * 100;
                  const y = 100 - (level / maxLevel) * 100;
                  return `L ${x},${y}`;
                }).join(' ')} L 100,100 Z`}
              />
              <path
                fill={`url(#eveningGrad-${settings.color})`}
                d={`M 0,100 ${days.map((day, index) => {
                  const dayData = groupedData[day.date] || {};
                  const level = dayData.evening?.level || 0;
                  const x = (index / (days.length - 1)) * 100;
                  const y = 100 - (level / maxLevel) * 100;
                  return `L ${x},${y}`;
                }).join(' ')} L 100,100 Z`}
                opacity="0.7"
              />
            </>
          )}

          {settings.style === 'bars' && days.map((day, index) => {
            const dayData = groupedData[day.date] || {};
            const morningLevel = dayData.morning?.level || 0;
            const eveningLevel = dayData.evening?.level || 0;
            const x = (index / days.length) * 100;
            const barWidth = 100 / days.length * 0.4;
            
            return (
              <g key={day.date}>
                <rect
                  x={x}
                  y={100 - (morningLevel / maxLevel) * 100}
                  width={barWidth}
                  height={(morningLevel / maxLevel) * 100}
                  fill={colors.morning}
                  opacity="0.8"
                  rx="0.5"
                  filter="url(#neonGlow)"
                />
                <rect
                  x={x + barWidth + 0.5}
                  y={100 - (eveningLevel / maxLevel) * 100}
                  width={barWidth}
                  height={(eveningLevel / maxLevel) * 100}
                  fill={colors.evening}
                  opacity="0.6"
                  rx="0.5"
                />
              </g>
            );
          })}

          {/* Линии */}
          {(settings.style === 'line' || settings.style === 'area') && (
            <>
              <path
                fill="none"
                stroke={colors.morning}
                strokeWidth="1.5"
                filter="url(#neonGlow)"
                d={`M ${days.map((day, index) => {
                  const dayData = groupedData[day.date] || {};
                  const level = dayData.morning?.level || 0;
                  const x = (index / (days.length - 1)) * 100;
                  const y = 100 - (level / maxLevel) * 100;
                  return `${index === 0 ? '' : 'L'} ${x},${y}`;
                }).join(' ')}`}
              />
              <path
                fill="none"
                stroke={colors.evening}
                strokeWidth="1.5"
                strokeDasharray="3,3"
                filter="url(#neonGlow)"
                d={`M ${days.map((day, index) => {
                  const dayData = groupedData[day.date] || {};
                  const level = dayData.evening?.level || 0;
                  const x = (index / (days.length - 1)) * 100;
                  const y = 100 - (level / maxLevel) * 100;
                  return `${index === 0 ? '' : 'L'} ${x},${y}`;
                }).join(' ')}`}
              />
            </>
          )}

          {/* Светящиеся точки */}
          {(settings.style === 'line' || settings.style === 'area') && days.map((day, index) => {
            const dayData = groupedData[day.date] || {};
            return (
              <g key={`points-${index}`}>
                {dayData.morning && (
                  <g>
                    <circle
                      cx={(index / (days.length - 1)) * 100}
                      cy={100 - (dayData.morning.level / maxLevel) * 100}
                      r="3"
                      fill={colors.morning}
                      filter="url(#neonGlow)"
                    />
                    <circle
                      cx={(index / (days.length - 1)) * 100}
                      cy={100 - (dayData.morning.level / maxLevel) * 100}
                      r="1.5"
                      fill="#ffffff"
                    />
                  </g>
                )}
                {dayData.evening && (
                  <g>
                    <circle
                      cx={(index / (days.length - 1)) * 100}
                      cy={100 - (dayData.evening.level / maxLevel) * 100}
                      r="3"
                      fill={colors.evening}
                      filter="url(#neonGlow)"
                    />
                    <circle
                      cx={(index / (days.length - 1)) * 100}
                      cy={100 - (dayData.evening.level / maxLevel) * 100}
                      r="1.5"
                      fill="#ffffff"
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Подписи дней */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between">
          {displayDays.map((day, index) => (
            <div key={`day-${index}`} className="text-white/60 text-xs text-center">
              {day.label}
            </div>
          ))}
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-3 text-center mb-4">
        <div>
          <div 
            className="text-base font-bold"
            style={{ color: colors.morning, textShadow: `0 0 10px ${colors.glow}` }}
          >
            {chartData.length > 0 ? Math.round(chartData.reduce((sum, entry) => sum + entry.level, 0) / chartData.length) : 0}
          </div>
          <div className="text-white/60 text-xs">Средний</div>
        </div>
        <div>
          <div 
            className="text-base font-bold"
            style={{ color: colors.evening, textShadow: `0 0 10px ${colors.glow}` }}
          >
            {chartData.length}
          </div>
          <div className="text-white/60 text-xs">Записей</div>
        </div>
      </div>

      {/* Легенда */}
      <div className="flex items-center justify-center space-x-6 text-xs pt-3 border-t border-white/10">
        <div className="flex items-center space-x-2">
          <div 
            className="w-4 h-1 rounded-full"
            style={{ backgroundColor: colors.morning, boxShadow: `0 0 8px ${colors.glow}` }}
          ></div>
          <span className="text-white/70">Утро</span>
        </div>
        <div className="flex items-center space-x-2">
          <div 
            className="w-4 h-1 rounded-full opacity-80" 
            style={{ 
              backgroundColor: colors.evening,
              backgroundImage: `repeating-linear-gradient(90deg, ${colors.evening} 0px, ${colors.evening} 3px, transparent 3px, transparent 6px)`
            }}
          ></div>
          <span className="text-white/70">Вечер</span>
        </div>
      </div>
    </div>
  );
}
