import { useState } from 'react';
import MeditationModal from './MeditationModal';

interface MeditationWidgetProps {
  className?: string;
}

export default function MeditationWidget({ className = '' }: MeditationWidgetProps) {
  const [showMeditation, setShowMeditation] = useState(false);

  return (
    <>
      <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
              style={{ boxShadow: '0 0 20px rgba(16,185,129,0.35)' }}
            >
              {/* листик (inline svg, без внешних иконок) */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 20c6 0 11-5 11-11V4c-6 0-11 5-11 11v5Z" stroke="white" strokeWidth="2" />
                <path d="M9 15c0-3 3-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3 className="text-white text-base font-semibold">Медитация</h3>
              <p className="text-white/70 text-sm">Практики осознанности</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowMeditation(true)}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
          style={{ boxShadow: '0 10px 30px rgba(16,185,129,0.35)' }}
        >
          <span className="text-lg">🧘‍♂️</span>
          <span>Открыть медитацию</span>
        </button>
      </div>

      <MeditationModal isOpen={showMeditation} onClose={() => setShowMeditation(false)} />
    </>
  );
}
