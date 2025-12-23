
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/feature/BottomNavigation';
import GlassCard from '../../components/base/GlassCard';
import EmotionChart from '../../components/feature/EmotionChart';
import NeonButton from '../../components/base/NeonButton';
import { dbManager, getTelegramUserId, type EmotionEntry } from '../../utils/database';

export default function Emotions() {
  const navigate = useNavigate();
  const [emotionHistory, setEmotionHistory] = useState<EmotionEntry[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'morning' | 'evening'>('all');
  const [loading, setLoading] = useState(true);

  const emotions = [
    { key: 'joy', label: 'Радость', color: '#fbbf24', icon: 'ri-emotion-happy-line' },
    { key: 'calm', label: 'Спокойствие', color: '#06b6d4', icon: 'ri-leaf-line' },
    { key: 'energy', label: 'Энергия', color: '#f97316', icon: 'ri-flashlight-line' },
    { key: 'love', label: 'Любовь', color: '#ec4899', icon: 'ri-heart-line' },
    { key: 'confidence', label: 'Уверенность', color: '#8b5cf6', icon: 'ri-shield-check-line' },
    { key: 'gratitude', label: 'Благодарность', color: '#10b981', icon: 'ri-hand-heart-line' },
    { key: 'anxiety', label: 'Тревога', color: '#ef4444', icon: 'ri-alarm-warning-line' },
    { key: 'sadness', label: 'Грусть', color: '#6b7280', icon: 'ri-emotion-sad-line' },
    { key: 'anger', label: 'Гнев', color: '#dc2626', icon: 'ri-fire-line' },
    { key: 'fear', label: 'Страх', color: '#7c3aed', icon: 'ri-ghost-line' }
  ];

  useEffect(() => {
    loadEmotionHistory();
  }, []);

  const loadEmotionHistory = async () => {
    try {
      await dbManager.init();
      const telegramId = getTelegramUserId();
      const entries = await dbManager.getEmotionEntriesByTelegramId(telegramId);
      setEmotionHistory(entries);
    } catch (error) {
      console.error('Ошибка загрузки истории эмоций:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = emotionHistory.filter(entry => 
    selectedFilter === 'all' || entry.type === selectedFilter
  );

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long' 
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getEmotionConfig = (emotion: string) => {
    return emotions.find(e => e.key === emotion) || emotions[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Загрузка эмоций...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 pb-28">
        {/* Header */}
        <div className="bg-black/40 backdrop-blur-sm border-b border-white/10 px-4 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">Эмоции</h1>
            <button 
              onClick={() => navigate('/')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <i className="ri-close-line text-xl text-white"></i>
            </button>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* График эмоций */}
          <EmotionChart />

          {/* Фильтры */}
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'Все', icon: 'ri-calendar-line' },
              { key: 'morning', label: 'Утро', icon: 'ri-sun-line' },
              { key: 'evening', label: 'Вечер', icon: 'ri-moon-line' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                  selectedFilter === filter.key
                    ? 'bg-cyan-400 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                style={{
                  boxShadow: selectedFilter === filter.key ? '0 0 15px rgba(6, 182, 212, 0.4)' : 'none'
                }}
              >
                <i className={filter.icon}></i>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>

          {/* История эмоций */}
          {filteredHistory.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-white text-lg font-semibold">История записей</h3>
              {filteredHistory.map((entry, index) => {
                const emotionConfig = getEmotionConfig(entry.emotion);
                return (
                  <GlassCard key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-12 h-12 flex items-center justify-center rounded-full"
                          style={{ 
                            backgroundColor: emotionConfig.color + '20',
                            border: `2px solid ${emotionConfig.color}`,
                            boxShadow: `0 0 15px ${emotionConfig.color}40`
                          }}
                        >
                          <i className={`${emotionConfig.icon} text-xl`} style={{ color: emotionConfig.color }}></i>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{emotionConfig.label}</h4>
                          <div className="flex items-center space-x-2 text-sm text-white/60">
                            <span>{formatDate(entry.created_at)}</span>
                            <span>•</span>
                            <span>{formatTime(entry.created_at)}</span>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <i className={entry.type === 'morning' ? 'ri-sun-line' : 'ri-moon-line'}></i>
                              <span>{entry.type === 'morning' ? 'Утро' : 'Вечер'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">{entry.level}/10</div>
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <i 
                              key={i}
                              className={`ri-star-${i < entry.level / 2 ? 'fill' : 'line'} text-sm`}
                              style={{ color: emotionConfig.color }}
                            ></i>
                          ))}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            <GlassCard className="p-8">
              <div className="text-center">
                <i className="ri-emotion-line text-white/40 text-4xl mb-4"></i>
                <h3 className="text-white text-lg font-semibold mb-2">Нет записей</h3>
                <p className="text-white/60 text-sm mb-6">
                  {selectedFilter === 'all' 
                    ? 'Начните делать ежедневные чек-ины, чтобы отслеживать свои эмоции'
                    : `Нет записей за ${selectedFilter === 'morning' ? 'утро' : 'вечер'}`}
                </p>
                <div className="flex space-x-3 justify-center">
                  <NeonButton 
                    onClick={() => navigate('/checkin/morning')}
                    className="flex-1 py-3 text-sm"
                  >
                    <i className="ri-sun-line mr-2"></i>
                    Утренний чек-ин
                  </NeonButton>
                  <NeonButton 
                    onClick={() => navigate('/checkin/evening')}
                    className="flex-1 py-3 text-sm"
                  >
                    <i className="ri-moon-line mr-2"></i>
                    Вечерний чек-аут
                  </NeonButton>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
