import React from 'react';

export default function Card({ children, className = '', glow = false, ...props }) {
  return (
    <div
      className={`glass-card rounded-2xl p-5 ${glow ? 'gradient-border-teal-violet shadow-[0_0_30px_rgba(20,184,166,0.1)]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
