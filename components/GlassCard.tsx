'use client';

import React, { useState, useEffect } from 'react';

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowColor?: 'cyan' | 'emerald' | 'violet' | 'amber' | 'blue' | 'none';
  animate?: boolean;
  delay?: number;
  onClick?: () => void;
}

const glowColorClasses: Record<NonNullable<GlassCardProps['glowColor']>, string> = {
  cyan: 'hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
  emerald: 'hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
  violet: 'hover:border-violet-500/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]',
  amber: 'hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
  blue: 'hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
  none: 'hover:border-white/20 hover:shadow-lg hover:shadow-black/40',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  glowColor = 'cyan',
  animate = true,
  delay = 0,
  onClick,
}) => {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, delay * 1000 + 50);
    return () => clearTimeout(timer);
  }, [animate, delay]);

  const baseClasses = 'relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 p-6 transition-all duration-300 shadow-xl shadow-black/20';
  const hoverClasses = hoverEffect ? `hover:-translate-y-1 cursor-pointer ${glowColorClasses[glowColor]}` : '';
  const combinedClasses = `${baseClasses} ${hoverClasses} ${className}`.trim();

  if (!animate) {
    return (
      <div className={combinedClasses} onClick={onClick}>
        <div className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        {children}
      </div>
    );
  }

  return (
    <div
      className={combinedClasses}
      style={{
        opacity: isAnimated ? 1 : 0,
        transform: isAnimated ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
      onClick={onClick}
    >
      <div className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
      {children}
    </div>
  );
};
