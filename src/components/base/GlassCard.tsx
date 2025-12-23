
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
      background: 'rgba(255, 255, 255, 0.04)',
      border: 'rgba(255, 255, 255, 0.1)',
      blur: 'blur(20px) saturate(180%)',
      shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2), 0 0 20px rgba(6, 182, 212, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
    },
    elevated: {
      background: 'rgba(255, 255, 255, 0.06)',
      border: 'rgba(255, 255, 255, 0.12)',
      blur: 'blur(25px) saturate(200%)',
      shadow: '0 12px 40px 0 rgba(0, 0, 0, 0.3), 0 0 30px rgba(6, 182, 212, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    },
    subtle: {
      background: 'rgba(255, 255, 255, 0.02)',
      border: 'rgba(255, 255, 255, 0.08)',
      blur: 'blur(15px) saturate(160%)',
      shadow: '0 4px 16px 0 rgba(0, 0, 0, 0.15), 0 0 10px rgba(6, 182, 212, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    }
  };

  const style = variantStyles[variant];

  return (
    <div 
      className={`relative backdrop-blur-xl rounded-3xl border transition-all duration-300 overflow-hidden group ${className}`}
      onClick={onClick}
      style={{
        background: style.background,
        border: `1px solid ${style.border}`,
        boxShadow: style.shadow,
        backdropFilter: style.blur,
        WebkitBackdropFilter: style.blur,
      }}
    >
      {/* Стеклянный эффект преломления */}
      <div 
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: `
            linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, transparent 50%, rgba(255, 255, 255, 0.04) 100%),
            radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)
          `,
          backdropFilter: 'blur(20px) contrast(120%) brightness(105%)',
          WebkitBackdropFilter: 'blur(20px) contrast(120%) brightness(105%)',
        }}
      />
      
      {/* Блик как в iOS */}
      <div 
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
      />
      
      {/* Контент */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

