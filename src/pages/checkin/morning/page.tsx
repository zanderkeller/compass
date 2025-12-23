
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../../components/base/GlassCard';
import NeonButton from '../../../components/base/NeonButton';
import { dbManager, getTelegramUserId } from '../../../utils/database';

type Emotion = 'joy' | 'calm' | 'energy' | 'love' | 'confidence' | 'gratitude' | 'anxiety' | 'sadness' | 'anger' | 'fear';

export default function MorningCheckin() {
  const navigate = useNavigate();
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [emotionLevel, setEmotionLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [morningMood, setMorningMood] = useState('');
  const [todayGoals, setTodayGoals] = useState('');
  const [intention, setIntention] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const emotions = [
    { key: 'joy' as Emotion, label: 'Радость', color: '#fbbf24', icon: 'ri-emotion-happy-line' },
    { key: 'calm' as Emotion, label: 'Спокойствие', color: '#06b6d4', icon: 'ri-leaf-line' },
    { key: 'energy' as Emotion, label: 'Энергия', color: '#f97316', icon: 'ri-flashlight-line' },
    { key: 'love' as Emotion, label: 'Любовь', color: '#ec4899', icon: 'ri-heart-line' },
    { key: 'confidence' as Emotion, label: 'Уверенность', color: '#8b5cf6', icon: 'ri-shield-check-line' },
    { key: 'gratitude' as Emotion, label: 'Благодарность', color: '#10b981', icon: 'ri-hand-heart-line' },
    { key: 'anxiety' as Emotion, label: 'Тревога', color: '#ef4444', icon: 'ri-alarm-warning-line' },
    { key: 'sadness' as Emotion, label: 'Грусть', color: '#6b7280', icon: 'ri-emotion-sad-line' },
    { key: 'anger' as Emotion, label: 'Гнев', color: '#dc2626', icon: 'ri-fire-line' },
    { key: 'fear' as Emotion, label: 'Страх', color: '#7c3aed', icon: 'ri-ghost-line' }
  ];

  useEffect(() => {
    const initDatabase = async () => {
      try {
        await dbManager.init();
        
        // Проверяем, есть ли уже запись за сегодня
        const today = new Date().toISOString().split('T')[0];
        const telegramId = getTelegramUserId();
        const existingEntry = await dbManager.getEmotionEntryByDate(telegramId, today, 'morning');
        
        if (existingEntry) {
          // Загружаем существующие данные
          setSelectedEmotion(existingEntry.emotion as Emotion);
          setEmotionLevel(existingEntry.level);
          setSleepQuality(existingEntry.sleep_quality || 5);
          setMorningMood(existingEntry.morning_mood || '');
          setTodayGoals(existingEntry.today_goals || '');
          setIntention(existingEntry.intention || '');
          setShowWarning(true);
        } else {
          // Очищаем поля для новой записи
          setSelectedEmotion(null);
          setEmotionLevel(5);
          setSleepQuality(5);
          setMorningMood('');
          setTodayGoals('');
          setIntention('');
          setShowWarning(false);
        }
        
        setInitialized(true);
      } catch (error) {
        console.error('Ошибка инициализации:', error);
        setInitialized(true);
      }
    };

    initDatabase();
  }, []);

  const handleSave = async () => {
    if (!selectedEmotion) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const telegramId = getTelegramUserId();
      
      const emotionEntry = {
        telegram_id: telegramId,
        type: 'morning' as const,
        emotion: selectedEmotion,
        level: emotionLevel,
        date: today,
        sleep_quality: sleepQuality,
        morning_mood: morningMood,
        today_goals: todayGoals,
        intention,
        created_at: new Date().toISOString()
      };

      await dbManager.createEmotionEntry(emotionEntry);
      navigate('/');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-yellow-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-yellow-200">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-yellow-900 to-pink-900 pb-20">
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-yellow-500/20">
                <i className="ri-alarm-warning-line text-3xl text-yellow-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Данные уже записаны</h3>
              <p className="text-white/70 mb-6">Вы уже делали утренний чек-ин сегодня. Хотите изменить данные?</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => setShowWarning(false)}
                  className="flex-1 px-4 py-2 bg-yellow-500 border border-yellow-400 rounded-lg text-white hover:bg-yellow-600 transition-colors"
                >
                  Изменить
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-yellow-500/20 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors backdrop-blur-sm"
          >
            <i className="ri-arrow-left-line text-xl text-yellow-200"></i>
          </button>
          <h1 className="text-xl font-semibold text-yellow-100">Утренний чек-ин</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Greeting */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-yellow-100 mb-2">Доброе утро! ☀️</h2>
          <p className="text-yellow-300">Как вы себя чувствуете?</p>
        </div>

        {/* Emotion Selection */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Ваше настроение сейчас</h3>
          <div className="grid grid-cols-3 gap-3">
            {emotions.map((emotion) => (
              <button
                key={emotion.key}
                onClick={() => setSelectedEmotion(emotion.key)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  selectedEmotion === emotion.key
                    ? 'border-yellow-400 bg-yellow-500/20'
                    : 'border-yellow-500/30 bg-black/20 hover:border-yellow-400/50'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center mx-auto mb-2">
                  <i className={`${emotion.icon} text-xl`} style={{ color: emotion.color }}></i>
                </div>
                <div className="text-xs font-medium text-yellow-200 leading-tight">{emotion.label}</div>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Emotion Level */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Уровень интенсивности</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-white/60">
              <span>Низкий</span>
              <span>Высокий</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={emotionLevel}
                onChange={(e) => setEmotionLevel(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <style>{`
                .slider::-webkit-slider-thumb {
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: linear-gradient(45deg, #f59e0b, #ec4899);
                  cursor: pointer;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .slider::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: linear-gradient(45deg, #f59e0b, #ec4899);
                  cursor: pointer;
                  border: none;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
              `}</style>
            </div>
            <div className="text-center">
              <span className="text-lg font-semibold text-yellow-400">{emotionLevel}/10</span>
            </div>
          </div>
        </GlassCard>

        {/* Sleep Quality */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Качество сна</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-white/60">
              <span>Плохо</span>
              <span>Отлично</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={sleepQuality}
                onChange={(e) => setSleepQuality(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <div className="text-center">
              <span className="text-lg font-semibold text-yellow-400">{sleepQuality}/10</span>
            </div>
          </div>
        </GlassCard>

        {/* Morning Mood */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Утреннее настроение</h3>
          <textarea
            value={morningMood}
            onChange={(e) => setMorningMood(e.target.value)}
            placeholder="Как вы себя чувствуете этим утром? Что на душе?"
            className="w-full h-24 p-3 border border-white/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-black/20 text-white placeholder-white/50"
          />
        </GlassCard>

        {/* Today Goals */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Цели на сегодня</h3>
          <textarea
            value={todayGoals}
            onChange={(e) => setTodayGoals(e.target.value)}
            placeholder="Что вы планируете сделать сегодня?"
            className="w-full h-24 p-3 border border-white/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-black/20 text-white placeholder-white/50"
          />
        </GlassCard>

        {/* Intention */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Намерение дня</h3>
          <textarea
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="С каким намерением вы проживете этот день?"
            className="w-full h-24 p-3 border border-white/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-black/20 text-white placeholder-white/50"
          />
        </GlassCard>

        {/* Submit Button */}
        <NeonButton
          onClick={handleSave}
          disabled={!selectedEmotion || loading}
          className="w-full"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Сохранение...
            </div>
          ) : (
            <>
              <i className="ri-check-line mr-2"></i>
              Сохранить чек-ин
            </>
          )}
        </NeonButton>
      </div>
    </div>
  );
}