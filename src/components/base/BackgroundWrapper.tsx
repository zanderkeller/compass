import { type ReactNode } from 'react';
import DynamicBackground, { getTimeOfDay } from '../feature/DynamicBackground';

interface BackgroundWrapperProps {
  children: ReactNode;
  backgroundType?: 'dynamic' | 'gradient' | 'solid';
  customBackground?: string;
  className?: string;
}

export default function BackgroundWrapper({
  children,
  backgroundType = 'dynamic',
  customBackground,
  className = ''
}: BackgroundWrapperProps) {
  const renderBackground = () => {
    switch (backgroundType) {
      case 'dynamic':
        return <DynamicBackground timeOfDay={getTimeOfDay()} />;
      case 'gradient':
        return (
          <div
            className="fixed inset-0"
            style={{
              background: customBackground || 'linear-gradient(to bottom, #2D1B69 0%, #FF8C69 100%)'
            }}
          />
        );
      case 'solid':
        return (
          <div
            className="fixed inset-0"
            style={{
              backgroundColor: customBackground || '#2D1B69'
            }}
          />
        );
      default:
        return <DynamicBackground timeOfDay={getTimeOfDay()} />;
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${className}`}>
      {renderBackground()}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
