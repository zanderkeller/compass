import { useEffect, useState } from 'react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function CelebrationModal({ isOpen, onClose, title, message }: CelebrationModalProps) {
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowFireworks(true);
      // Автоматически закрываем через 3 секунды
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowFireworks(false);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Размытый фон */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-md transition-all duration-500"
        onClick={onClose}
      />
      
      {/* Фейерверки */}
      {showFireworks && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Анимированные частицы фейерверка */}
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#fbbf24', '#ec4899', '#06b6d4', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
          
          {/* Звездочки */}
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={`star-${i}`}
              className="absolute text-yellow-400 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${12 + Math.random() * 8}px`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${0.8 + Math.random() * 0.4}s`
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно */}
      <div className="relative bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mx-4 max-w-sm w-full text-center transform transition-all duration-500 scale-100 animate-pulse">
        {/* Иконка достижения */}
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
          <i className="ri-trophy-fill text-3xl text-white"></i>
        </div>

        {/* Заголовок */}
        <h2 className="text-2xl font-bold text-white mb-4 animate-pulse">
          {title}
        </h2>

        {/* Сообщение */}
        <p className="text-white/80 text-lg mb-6 leading-relaxed">
          {message}
        </p>

        {/* Эмодзи празднования */}
        <div className="text-4xl mb-4 animate-bounce">
          🎉🎊🏆
        </div>

        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Продолжить
        </button>
      </div>
    </div>
  );
}