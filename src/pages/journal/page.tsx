
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/feature/BottomNavigation';
import GlassCard from '../../components/base/GlassCard';
import NeonButton from '../../components/base/NeonButton';
import { dbManager, getTelegramUserId, type JournalEntry } from '../../utils/database';

interface WeeklyReport {
  id?: number;
  telegram_id: number;
  week_start: string;
  week_end: string;
  analysis: string;
  recommendations: string;
  emotion_summary: string;
  created_at: string;
}

export default function Journal() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showWeeklyReportForm, setShowWeeklyReportForm] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'entries' | 'reports'>('entries');
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: '',
    tags: ''
  });

  const moods = [
    { key: 'happy', label: 'Радостное', color: '#fbbf24', icon: 'ri-emotion-happy-line' },
    { key: 'calm', label: 'Спокойное', color: '#06b6d4', icon: 'ri-leaf-line' },
    { key: 'excited', label: 'Воодушевленное', color: '#f97316', icon: 'ri-flashlight-line' },
    { key: 'thoughtful', label: 'Задумчивое', color: '#8b5cf6', icon: 'ri-brain-line' },
    { key: 'grateful', label: 'Благодарное', color: '#10b981', icon: 'ri-hand-heart-line' },
    { key: 'anxious', label: 'Тревожное', color: '#ef4444', icon: 'ri-alarm-warning-line' },
    { key: 'sad', label: 'Грустное', color: '#6b7280', icon: 'ri-emotion-sad-line' },
    { key: 'neutral', label: 'Нейтральное', color: '#9ca3af', icon: 'ri-emotion-normal-line' }
  ];

  useEffect(() => {
    loadJournalData();
  }, []);

  const loadJournalData = async () => {
    try {
      await dbManager.init();
      const telegramId = getTelegramUserId();
      
      // Загружаем обычные записи
      const journalEntries = await dbManager.getJournalEntriesByTelegramId(telegramId);
      setEntries(journalEntries);
      
      // Загружаем еженедельные отчеты (пока из localStorage, позже добавим в базу)
      const savedReports = localStorage.getItem(`weekly_reports_${telegramId}`);
      if (savedReports) {
        setWeeklyReports(JSON.parse(savedReports));
      }
    } catch (error) {
      console.error('Ошибка загрузки журнала:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;

    try {
      const telegramId = getTelegramUserId();
      const now = new Date().toISOString();

      const entry: JournalEntry = {
        telegram_id: telegramId,
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood,
        tags: newEntry.tags,
        created_at: now
      };

      const id = await dbManager.createJournalEntry(entry);
      
      const newJournalEntry: JournalEntry = {
        ...entry,
        id
      };

      setEntries(prev => [newJournalEntry, ...prev]);
      setNewEntry({ title: '', content: '', mood: '', tags: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Ошибка создания записи:', error);
    }
  };

  const generateWeeklyReport = async () => {
    setGeneratingReport(true);
    
    try {
      const telegramId = getTelegramUserId();
      
      // Получаем эмоциональные данные за последнюю неделю
      const emotionEntries = await dbManager.getEmotionEntriesByTelegramId(telegramId, 50);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weeklyEmotions = emotionEntries.filter(entry => 
        new Date(entry.created_at) >= weekAgo
      );

      if (weeklyEmotions.length === 0) {
        alert('Недостаточно данных для создания отчета. Делайте ежедневные чек-ины в течение недели.');
        setGeneratingReport(false);
        return;
      }

      // Подготавливаем данные для отправки в LLM
      const emotionSummary = weeklyEmotions.map(entry => ({
        date: entry.date,
        type: entry.type,
        emotion: entry.emotion,
        level: entry.level,
        feelings: entry.feelings,
        goals: entry.goals,
        gratitude: entry.gratitude
      }));

      console.log('Отправляем запрос к DeepSeek API с данными:', emotionSummary);

      // Отправляем запрос к DeepSeek API
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-6dc131bde15a412baea0c1c9035d0607'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `Ты - опытный психолог и коуч по личностному развитию. Проанализируй эмоциональные данные пользователя за неделю и создай подробный отчет на русском языке.

Структура ответа должна быть в формате JSON:
{
  "analysis": "Подробный анализ эмоционального состояния за неделю",
  "recommendations": "Конкретные рекомендации для улучшения эмоционального благополучия",
  "emotion_summary": "Краткое резюме основных эмоциональных паттернов"
}

Анализ должен включать:
- Общие эмоциональные тенденции
- Выявленные паттерны и циклы
- Сильные и слабые стороны
- Прогресс по сравнению с предыдущими периодами (если применимо)

Рекомендации должны быть:
- Конкретными и применимыми
- Основанными на данных
- Направленными на улучшение эмоционального состояния
- Включать практические упражнения или техники`
            },
            {
              role: 'user',
              content: `Проанализируй мои эмоциональные данные за неделю: ${JSON.stringify(emotionSummary)}`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      console.log('Статус ответа от API:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка API:', errorText);
        throw new Error(`Ошибка при обращении к AI сервису: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Полный ответ от API:', data);

      // Проверяем структуру ответа
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Неожиданная структура ответа:', data);
        throw new Error('Неожиданная структура ответа от AI сервиса');
      }

      const aiResponseText = data.choices[0].message.content;
      console.log('Текст ответа от ИИ:', aiResponseText);

      let aiResponse;
      try {
        aiResponse = JSON.parse(aiResponseText);
        console.log('Парсированный ответ от ИИ:', aiResponse);
      } catch (parseError) {
        console.error('Ошибка парсинга JSON ответа:', parseError);
        console.log('Исходный текст:', aiResponseText);
        
        // Если не удалось распарсить JSON, создаем структуру вручную
        aiResponse = {
          analysis: aiResponseText.includes('анализ') ? aiResponseText : 'Анализ эмоционального состояния за неделю показывает разнообразие переживаний.',
          recommendations: 'Рекомендуется продолжать ведение дневника эмоций и практиковать осознанность.',
          emotion_summary: 'Общий эмоциональный фон стабильный с периодами подъемов и спадов.'
        };
      }

      // Создаем еженедельный отчет
      const weekStart = new Date(weekAgo).toISOString().split('T')[0];
      const weekEnd = new Date().toISOString().split('T')[0];
      
      const report: WeeklyReport = {
        telegram_id: telegramId,
        week_start: weekStart,
        week_end: weekEnd,
        analysis: aiResponse.analysis || 'Анализ недоступен',
        recommendations: aiResponse.recommendations || 'Рекомендации недоступны',
        emotion_summary: aiResponse.emotion_summary || 'Резюме недоступно',
        created_at: new Date().toISOString()
      };

      console.log('Создаем отчет:', report);

      // Сохраняем отчет (пока в localStorage, позже добавим в базу)
      const savedReports = localStorage.getItem(`weekly_reports_${telegramId}`);
      const reports = savedReports ? JSON.parse(savedReports) : [];
      reports.unshift(report);
      localStorage.setItem(`weekly_reports_${telegramId}`, JSON.stringify(reports));
      
      console.log('Отчет сохранен в localStorage');
      
      setWeeklyReports(reports);
      setShowWeeklyReportForm(false);
      setSelectedTab('reports');
      
    } catch (error) {
      console.error('Подробная ошибка создания отчета:', error);
      
      // Показываем более информативное сообщение об ошибке
      let errorMessage = 'Произошла ошибка при создании отчета.';
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Ошибка подключения к сервису ИИ. Проверьте интернет-соединение.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Ошибка авторизации API. Проверьте токен доступа.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Превышен лимит запросов. Попробуйте позже.';
        } else {
          errorMessage = `Ошибка: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setGeneratingReport(false);
    }
  };

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
        month: 'long',
        year: 'numeric'
      });
    }
  };

  const formatWeekRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return `${start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const getMoodConfig = (mood: string) => {
    return moods.find(m => m.key === mood) || moods[moods.length - 1];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Загрузка журнала...</p>
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-white">Журнал</h1>
            <button 
              onClick={() => navigate('/')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <i className="ri-close-line text-xl text-white"></i>
            </button>
          </div>

          {/* Табы */}
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedTab('entries')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                selectedTab === 'entries'
                  ? 'bg-cyan-400 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              style={{
                boxShadow: selectedTab === 'entries' ? '0 0 15px rgba(6, 182, 212, 0.4)' : 'none'
              }}
            >
              <i className="ri-book-line"></i>
              <span>Записи</span>
            </button>
            <button
              onClick={() => setSelectedTab('reports')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                selectedTab === 'reports'
                  ? 'bg-purple-400 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              style={{
                boxShadow: selectedTab === 'reports' ? '0 0 15px rgba(168, 85, 247, 0.4)' : 'none'
              }}
            >
              <i className="ri-file-chart-line"></i>
              <span>Отчеты</span>
              {weeklyReports.length > 0 && (
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">{weeklyReports.length}</span>
              )}
            </button>
          </div>
        </div>

        <div className="px-4 py-6">
          {selectedTab === 'entries' ? (
            <>
              {/* Кнопка добавления записи */}
              <div className="mb-6">
                <NeonButton 
                  className="w-full py-3"
                  onClick={() => setShowAddForm(true)}
                >
                  <i className="ri-add-line mr-2"></i>
                  Новая запись
                </NeonButton>
              </div>

              {/* Список записей */}
              {entries.length > 0 ? (
                <div className="space-y-4">
                  {entries.map((entry) => {
                    const moodConfig = getMoodConfig(entry.mood || '');
                    return (
                      <GlassCard key={entry.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-white text-lg font-semibold mb-1">{entry.title}</h3>
                            <div className="flex items-center space-x-3 text-sm text-white/60 mb-2">
                              <span>{formatDate(entry.created_at)}</span>
                              {entry.mood && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center space-x-1">
                                    <i className={moodConfig.icon} style={{ color: moodConfig.color }}></i>
                                    <span>{moodConfig.label}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-white/80 text-sm leading-relaxed mb-3">
                          {entry.content}
                        </p>
                        
                        {entry.tags && (
                          <div className="flex flex-wrap gap-2">
                            {entry.tags.split(',').map((tag, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded-full"
                              >
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </GlassCard>
                    );
                  })}
                </div>
              ) : (
                <GlassCard className="p-8">
                  <div className="text-center">
                    <i className="ri-book-line text-white/40 text-4xl mb-4"></i>
                    <h3 className="text-white text-lg font-semibold mb-2">Нет записей</h3>
                    <p className="text-white/60 text-sm mb-6">
                      Начните вести журнал своих мыслей и переживаний
                    </p>
                    <NeonButton onClick={() => setShowAddForm(true)}>
                      <i className="ri-add-line mr-2"></i>
                      Создать первую запись
                    </NeonButton>
                  </div>
                </GlassCard>
              )}
            </>
          ) : (
            <>
              {/* Кнопка создания отчета */}
              <div className="mb-6">
                <NeonButton 
                  className="w-full py-3"
                  onClick={() => setShowWeeklyReportForm(true)}
                  disabled={generatingReport}
                >
                  {generatingReport ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Создание отчета...
                    </>
                  ) : (
                    <>
                      <i className="ri-magic-line mr-2"></i>
                      Создать еженедельный отчет
                    </>
                  )}
                </NeonButton>
              </div>

              {/* Список отчетов */}
              {weeklyReports.length > 0 ? (
                <div className="space-y-4">
                  {weeklyReports.map((report, index) => (
                    <GlassCard key={index} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-white text-lg font-semibold">Еженедельный анализ</h3>
                          <p className="text-white/60 text-sm">
                            {formatWeekRange(report.week_start, report.week_end)}
                          </p>
                        </div>
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-pink-500">
                          <i className="ri-file-chart-line text-white text-xl"></i>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-cyan-400 font-semibold mb-2">📊 Анализ</h4>
                          <p className="text-white/80 text-sm leading-relaxed">{report.analysis}</p>
                        </div>

                        <div>
                          <h4 className="text-green-400 font-semibold mb-2">💡 Рекомендации</h4>
                          <p className="text-white/80 text-sm leading-relaxed">{report.recommendations}</p>
                        </div>

                        <div>
                          <h4 className="text-yellow-400 font-semibold mb-2">🎯 Основные паттерны</h4>
                          <p className="text-white/80 text-sm leading-relaxed">{report.emotion_summary}</p>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <GlassCard className="p-8">
                  <div className="text-center">
                    <i className="ri-file-chart-line text-white/40 text-4xl mb-4"></i>
                    <h3 className="text-white text-lg font-semibold mb-2">Нет отчетов</h3>
                    <p className="text-white/60 text-sm mb-6">
                      Создайте свой первый еженедельный анализ эмоций с помощью ИИ
                    </p>
                    <NeonButton onClick={() => setShowWeeklyReportForm(true)}>
                      <i className="ri-magic-line mr-2"></i>
                      Создать отчет
                    </NeonButton>
                  </div>
                </GlassCard>
              )}
            </>
          )}
        </div>
      </div>

      {/* Форма добавления записи */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Новая запись</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              {/* Заголовок */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Заголовок</label>
                <input
                  type="text"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
                  placeholder="О чем эта запись?"
                />
              </div>

              {/* Содержание */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Содержание</label>
                <textarea
                  value={newEntry.content}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 resize-none"
                  placeholder="Поделитесь своими мыслями..."
                />
              </div>

              {/* Настроение */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Настроение</label>
                <div className="grid grid-cols-2 gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood.key}
                      onClick={() => setNewEntry(prev => ({ ...prev, mood: mood.key }))}
                      className={`p-3 rounded-lg transition-all flex items-center space-x-2 text-sm ${
                        newEntry.mood === mood.key
                          ? 'ring-2 ring-white/50 bg-white/10'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <i className={mood.icon} style={{ color: mood.color }}></i>
                      <span className="text-white/70">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Теги */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Теги</label>
                <input
                  type="text"
                  value={newEntry.tags}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
                  placeholder="работа, семья, здоровье..."
                />
              </div>

              {/* Кнопки */}
              <div className="flex space-x-3 pt-4">
                <NeonButton
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowAddForm(false)}
                >
                  Отмена
                </NeonButton>
                <NeonButton
                  className="flex-1"
                  onClick={addEntry}
                >
                  Сохранить
                </NeonButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Форма создания еженедельного отчета */}
      {showWeeklyReportForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-pink-500">
                <i className="ri-magic-line text-white text-2xl"></i>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">
                Еженедельный отчет
              </h3>
              
              <p className="text-white/70 text-sm">
                ИИ проанализирует ваши эмоции за последнюю неделю и даст персональные рекомендации
              </p>
            </div>

            <div className="space-y-3">
              <NeonButton
                className="w-full py-3"
                onClick={generateWeeklyReport}
                disabled={generatingReport}
              >
                {generatingReport ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Анализируем данные...
                  </>
                ) : (
                  <>
                    <i className="ri-magic-line mr-2"></i>
                    Создать отчет
                  </>
                )}
              </NeonButton>
              
              <button
                onClick={() => setShowWeeklyReportForm(false)}
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                disabled={generatingReport}
              >
                <i className="ri-close-line mr-2"></i>
                Отмена
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
