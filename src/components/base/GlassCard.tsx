interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'subtle';
}

export default function GlassCard({
  children,
  className = '',
  onClick,
  variant = 'default'
}: GlassCardProps) {
  const variantStyles = {
    default: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%)',
      border: 'rgba(255, 255, 255, 0.35)',
      blur: 'blur(40px) saturate(180%)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -1px 1px rgba(255, 255, 255, 0.1)',
    },
    elevated: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.12) 100%)',
      border: 'rgba(255, 255, 255, 0.45)',
      blur: 'blur(50px) saturate(200%)',
      shadow: '0 12px 48px rgba(0, 0, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.5), inset 0 -1px 1px rgba(255, 255, 255, 0.15)',
    },
    subtle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 50%, rgba(255, 255, 255, 0.07) 100%)',
      border: 'rgba(255, 255, 255, 0.25)',
      blur: 'blur(30px) saturate(160%)',
      shadow: '0 4px 20px rgba(0, 0, 0, 0.2), 0 1px 4px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.3), inset 0 -1px 1px rgba(255, 255, 255, 0.08)',
    }
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`relative rounded-3xl transition-all duration-300 overflow-hidden group ${className}`}
      onClick={onClick}
      style={{
        background: style.background,
        border: `1px solid ${style.border}`,
        boxShadow: style.shadow,
        backdropFilter: style.blur,
        WebkitBackdropFilter: style.blur,
      }}
    >
      {/* Liquid glass refraction - верхний блик */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: `
            linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, transparent 40%),
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 255, 255, 0.3) 0%, transparent 60%)
          `,
        }}
      />

      {/* Цветовое преломление по краям */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none opacity-40"
        style={{
          background: `
            linear-gradient(135deg, rgba(100, 200, 255, 0.1) 0%, transparent 30%),
            linear-gradient(225deg, rgba(255, 150, 200, 0.08) 0%, transparent 30%),
            linear-gradient(315deg, rgba(150, 255, 200, 0.06) 0%, transparent 30%)
          `,
        }}
      />

      {/* Верхняя светящаяся линия */}
      <div
        className="absolute top-0 left-4 right-4 h-[1px] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 20%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0.6) 80%, transparent 100%)',
        }}
      />

      {/* Нижняя тень для глубины */}
      <div
        className="absolute bottom-0 left-4 right-4 h-[1px] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.15) 20%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.15) 80%, transparent 100%)',
        }}
      />

      {/* Контент */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
