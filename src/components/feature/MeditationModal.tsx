import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type Meditation = {
  title: string;
  subtitle: string;
  durationMin: number;
  steps: string[];
  /** фон: /web/images/meditation/backgrounds/<file> */
  background?: string;
  color?: string;
};

const normalizeBase = (b?: string) => (b ? (b.endsWith('/') ? b : `${b}/`) : '/web/');
const BASE = normalizeBase((import.meta as any).env?.BASE_URL);

// Папки под твои файлы
const BG_BASE = `${BASE}images/meditation/backgrounds/`;
const MUSIC_BASE = `${BASE}audio/meditation/`;

// Сколько потенциальных треков ожидаем в папке (можешь положить меньше — код подстроится)
const MAX_TRACKS = 20;

const formatTime = (s: number) => {
  if (!isFinite(s) || s <= 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
};

export default function MeditationModal({ isOpen, onClose }: Props) {
  // Демоданные — можешь заменить/расширить (аудио теперь выбирается рандомно и не указывается тут)
  const meditations: Meditation[] = useMemo(
    () => [
      {
        title: 'Ясность ума',
        subtitle: 'Очищение ума для лучшей концентрации',
        durationMin: 5,
        background: 'clarity.jpg',
        color: 'from-cyan-500 to-blue-600',
        steps: [
          'Сядьте прямо, закройте глаза и расслабьтесь',
          'Представьте свой ум как чистое голубое небо',
          'Мысли — это облака, медленно проплывающие мимо',
          'Не цепляйтесь за мысли, просто наблюдайте',
          'Позвольте облакам-мысли свободно проходить',
          'Возвращайтесь к образу ясного неба ума',
          'Почувствуйте пространство и тишину внутри',
        ],
      },
      {
        title: 'Любящая доброта',
        subtitle: 'Развитие сострадания к себе и другим',
        durationMin: 6,
        background: 'metta.jpg',
        color: 'from-emerald-500 to-green-600',
        steps: [
          'Сделайте несколько глубоких вдохов и выдохов',
          'Пожелайте себе: «Пусть я буду спокоен и здоров»',
          'Вспомните дорогого человека и пошлите ему доброту',
          'Пожелайте: «Пусть ты будешь счастлив»',
          'Расширьте круг доброты на всех существ',
          'Ощутите мягкое тепло в области сердца',
        ],
      },
    ],
    []
  );

  const [current, setCurrent] = useState(0);
  const [isPlaying, setPlaying] = useState(false);
  const [isMuted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [trackIndex, setTrackIndex] = useState<number | null>(null); // 1..MAX_TRACKS
  const timerRef = useRef<number | null>(null);

  // АУДИО
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const m = meditations[current];
  const total = m.durationMin * 60;

  // Случайный индекс трека (1..MAX_TRACKS)
  const pickRandomTrack = () => Math.max(1, Math.ceil(Math.random() * MAX_TRACKS));

  // Подготовка трека: ставит src и содержит резерв при ошибке
  const prepareAndPlayAudio = (initial = false) => {
    if (!audioRef.current) return;

    // Если ещё не выбран — выбираем
    let idx = trackIndex ?? pickRandomTrack();
    setTrackIndex(idx);

    const tryPlay = (tryCount = 0) => {
      if (!audioRef.current) return;
      audioRef.current.src = `${MUSIC_BASE}meditation${idx}.mp3`;
      audioRef.current.loop = true;
      audioRef.current.muted = isMuted;

      audioRef.current
        .play()
        .then(() => {
          // успех
        })
        .catch(() => {
          // если не получилось, попробуем следующий индекс (на случай отсутствия файла)
          if (tryCount < MAX_TRACKS - 1) {
            idx = ((idx % MAX_TRACKS) + 1);
            setTrackIndex(idx);
            tryPlay(tryCount + 1);
          }
        });
    };

    // В первый запуск или при смене медитации — начинаем с нуля
    if (initial) {
      audioRef.current.currentTime = 0;
    }
    tryPlay(0);
  };

  // Сброс при закрытии
  useEffect(() => {
    if (!isOpen) {
      setPlaying(false);
      setElapsed(0);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isOpen]);

  // Автостоп по окончанию
  useEffect(() => {
    if (elapsed >= total && total > 0) {
      setPlaying(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [elapsed, total]);

  // Синхронизация mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const start = () => {
    if (isPlaying) return;
    setPlaying(true);

    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    // Музыка — подготавливаем и стартуем
    prepareAndPlayAudio(true);
  };

  const pause = () => {
    setPlaying(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const reset = () => {
    pause();
    setElapsed(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const switchMeditation = () => {
    // Пауза и сброс
    pause();
    setElapsed(0);
    setTrackIndex(null); // при новой медитации — новый рандомный трек
    const next = (current + 1) % meditations.length;
    setCurrent(next);
  };

  if (!isOpen) return null;

  const bgUrl = m.background ? `${BG_BASE}${m.background}` : undefined;
  const progress = total > 0 ? Math.min(100, Math.round((elapsed / total) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* затемнение с размытием */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md" 
        onClick={onClose}
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      />

      {/* карточка с жидким стеклом */}
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/15"
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(34, 211, 238, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* фон */}
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

        {/* контент */}
        <div className="relative flex h-full max-h-[92vh] flex-col pb-8">
          {/* header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10">
            <button
              onClick={onClose}
              className="rounded-xl bg-white/10 backdrop-blur-xl px-4 py-2 text-white text-sm font-medium hover:bg-white/15 transition-all duration-300 border border-white/15"
            >
              <i className="ri-close-line mr-1"></i>Закрыть
            </button>

            <button
              onClick={switchMeditation}
              className="rounded-xl bg-white/10 backdrop-blur-xl px-4 py-2 text-white text-sm font-medium hover:bg-white/15 transition-all duration-300 border border-white/15"
            >
              <i className="ri-refresh-line mr-1"></i>Другая
            </button>
          </div>

          {/* заголовок */}
          <div className="px-6 pt-6 text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-2">{m.title}</h2>
            <p className="text-white/70 text-sm mb-2">{m.subtitle}</p>
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 backdrop-blur-sm">
              <span className="text-cyan-300 text-sm font-semibold">{m.durationMin} минут</span>
            </div>
          </div>

          {/* большой таймер + кнопки */}
          <div className="px-6 pt-6 flex flex-col items-center gap-6">
            {/* круглый прогресс */}
            <div className="relative h-48 w-48 flex items-center justify-center">
              {/* фоновый круг */}
              <div className="absolute inset-0 rounded-full border-4 border-white/10 backdrop-blur-sm" />
              
              {/* прогресс-круг */}
              <svg className="absolute inset-0 h-48 w-48 -rotate-90" style={{ filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.3))' }}>
                <circle
                  cx="96"
                  cy="96"
                  r="90"
                  fill="none"
                  stroke="rgba(34, 211, 238, 0.2)"
                  strokeWidth="4"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="90"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="4"
                  strokeDasharray={`${(progress / 100) * 565.48} 565.48`}
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* центральный контент */}
              <div className="relative text-center z-10">
                <div className="text-4xl font-bold text-white">{formatTime(elapsed)}</div>
                <div className="text-sm text-white/60 mt-1">из {formatTime(total)}</div>
              </div>
            </div>

            {/* кнопки одного размера */}
            <div className="flex items-center gap-4">
              {/* Stop */}
              <button
                onClick={reset}
                aria-label="Сбросить"
                className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/15 border border-white/15 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                style={{
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
              >
                <span className="block h-5 w-5 bg-white rounded-[6px]" />
              </button>

              {/* Play/Pause */}
              <button
                onClick={isPlaying ? pause : start}
                aria-label={isPlaying ? 'Пауза' : 'Старт'}
                className="h-16 w-16 rounded-full text-white transition-all duration-300 active:scale-95 flex items-center justify-center hover:scale-110"
                style={{
                  background: isPlaying
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(249, 115, 22, 0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(16, 185, 129, 0.9) 100%)',
                  boxShadow: isPlaying
                    ? '0 12px 30px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    : '0 12px 30px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {isPlaying ? (
                  <span className="flex items-center gap-[8px]">
                    <span className="block h-6 w-[5px] rounded-sm bg-white" />
                    <span className="block h-6 w-[5px] rounded-sm bg-white" />
                  </span>
                ) : (
                  <span
                    className="block"
                    style={{
                      width: 0,
                      height: 0,
                      borderTop: '10px solid transparent',
                      borderBottom: '10px solid transparent',
                      borderLeft: '16px solid white',
                      marginLeft: '3px',
                    }}
                  />
                )}
              </button>

              {/* Mute */}
              <button
                onClick={() => setMuted((v) => !v)}
                aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}
                className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/15 border border-white/15 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                style={{
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Иконка динамика/мьют */}
                {isMuted ? (
                  // Speaker muted (⨯)
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4 10v4h4l5 4V6l-5 4H4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  // Speaker waves
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4 10v4h4l5 4V6l-5 4H4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M17 8c1.333 1.333 1.333 6.667 0 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M19.5 6c2 2 2 10 0 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Шаги — большой прокручиваемый блок */}
          <div className="mt-6 px-6 pb-6 flex-1">
            <div 
              className="rounded-2xl p-6 min-h-[36vh] max-h-[58vh] overflow-y-auto border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <div className="text-cyan-300 text-sm font-semibold text-center mb-4 uppercase tracking-wider">
                Шаги медитации
              </div>
              <ol className="text-white/90 text-base leading-relaxed list-decimal list-inside space-y-3">
                {m.steps.map((s, idx) => (
                  <li key={idx} className="text-white/80 hover:text-white transition-colors">
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* скрытый аудио-элемент */}
        <audio ref={audioRef} preload="auto" className="hidden" />
      </div>
    </div>
  );
}

