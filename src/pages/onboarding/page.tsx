
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/base/GlassCard';
import NeonButton from '../../components/base/NeonButton';
import { dbManager, getTelegramUserId, getTelegramUserData } from '../../utils/database';

interface OnboardingData {
  name: string;
  birthDate: string;
  birthPlace: string;
  aboutMe: string;
  problem: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);
  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    birthDate: '',
    birthPlace: '',
    aboutMe: '',
    problem: ''
  });

  const totalSteps = 5;

  useEffect(() => {
    const initDatabase = async () => {
      try {
        console.log('Инициализация базы данных...');
        await dbManager.init();
        
        const telegramId = getTelegramUserId();
        console.log(`Проверка пользователя с Telegram ID: ${telegramId}`);
        
        const existingUser = await dbManager.getUserByTelegramId(telegramId);
        
        if (existingUser) {
          console.log('Пользователь найден, переход на главную страницу');
          navigate('/', { replace: true });
          return;
        }
        
        console.log('Пользователь не найден, показываем онбординг');
        setCheckingUser(false);
      } catch (error) {
        console.error('Ошибка инициализации базы данных:', error);
        setCheckingUser(false);
      }
    };

    initDatabase();
  }, [navigate]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log('Сохранение данных пользователя...');
      
      const telegramUser = getTelegramUserData();
      const telegramId = getTelegramUserId();

      const userData = {
        telegram_id: telegramId,
        telegram_username: telegramUser.username,
        telegram_first_name: telegramUser.first_name,
        telegram_last_name: telegramUser.last_name,
        name: formData.name,
        birth_date: formData.birthDate,
        birth_place: formData.birthPlace,
        about_me: formData.aboutMe,
        problem: formData.problem,
        created_at: new Date().toISOString()
      };

      const userId = await dbManager.createUser(userData);
      console.log(`Пользователь создан с ID: ${userId}`);
      
      // Переходим на главную страницу
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Ошибка сохранения данных пользователя:', error);
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.name.trim().length > 0;
      case 2: return formData.birthDate.trim().length > 0;
      case 3: return formData.birthPlace.trim().length > 0;
      case 4: return formData.aboutMe.trim().length > 0;
      case 5: return formData.problem.trim().length > 0;
      default: return false;
    }
  };

  if (checkingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Проверка пользователя...</p>
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

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Хедер с прогрессом */}
        <div className="pt-6 pb-4 px-4">
          <div className="text-center mb-6">
            <h1 
              className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse"
              style={{ fontFamily: 'Pacifico, serif' }}
            >
              COMPASS
            </h1>
          </div>

          {/* Прогресс бар */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/70 text-sm">Шаг {step} из {totalSteps}</span>
              <span className="text-white/70 text-sm">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 px-4">
          <GlassCard className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                  style={{
                    boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)'
                  }}>
                    <i className="ri-user-line text-white text-3xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Добро пожаловать!</h2>
                  <p className="text-white/70">Как к вам обращаться?</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      placeholder="Введите ваше имя"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-pink-500"
                  style={{
                    boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)'
                  }}>
                    <i className="ri-calendar-line text-white text-3xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Дата рождения</h2>
                  <p className="text-white/70">Это поможет нам лучше понять вас</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Когда вы родились?
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => updateFormData('birthDate', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500"
                  style={{
                    boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)'
                  }}>
                    <i className="ri-map-pin-line text-white text-3xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Место рождения</h2>
                  <p className="text-white/70">Где вы появились на свет?</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Город, страна
                    </label>
                    <input
                      type="text"
                      value={formData.birthPlace}
                      onChange={(e) => updateFormData('birthPlace', e.target.value)}
                      placeholder="Например: Москва, Россия"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-5

0"
                  style={{
                    boxShadow: '0 0 30px rgba(251, 191, 36, 0.4)'
                  }}>
                    <i className="ri-heart-line text-white text-3xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">О себе</h2>
                  <p className="text-white/70">Расскажите немного о себе</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Что вас характеризует?
                    </label>
                    <textarea
                      value={formData.aboutMe}
                      onChange={(e) => updateFormData('aboutMe', e.target.value)}
                      placeholder="Ваши интересы, хобби, особенности характера..."
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent backdrop-blur-sm resize-none"
                    />
                    <p className="text-white/40 text-xs mt-1">
                      {formData.aboutMe.length}/500 символов
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-red-400 to-pink-500"
                  style={{
                    boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)'
                  }}>
                    <i className="ri-question-line text-white text-3xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Ваша цель</h2>
                  <p className="text-white/70">С чем хотите поработать?</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Какую проблему хотите решить?
                    </label>
                    <textarea
                      value={formData.problem}
                      onChange={(e) => updateFormData('problem', e.target.value)}
                      placeholder="Стресс, тревожность, отношения, самооценка..."
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-transparent backdrop-blur-sm resize-none"
                    />
                    <p className="text-white/40 text-xs mt-1">
                      {formData.problem.length}/500 символов
                    </p>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Кнопки навигации */}
        <div className="p-4 space-y-3">
          <NeonButton
            onClick={handleNext}
            disabled={!isStepValid() || loading}
            className="w-full py-4"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Сохранение...
              </div>
            ) : (
              step === totalSteps ? 'Завершить' : 'Далее'
            )}
          </NeonButton>

          {step > 1 && !loading && (
            <NeonButton
              onClick={handleBack}
              variant="secondary"
              className="w-full py-3"
            >
              Назад
            </NeonButton>
          )}
        </div>
      </div>
    </div>
  );
}
