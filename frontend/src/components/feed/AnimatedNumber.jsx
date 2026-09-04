import React, { useState, useEffect, useRef } from 'react';

export default function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  className = '',
  duration = 800,
  flashOnChange = true
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const [flashClass, setFlashClass] = useState('');
  const prevValueRef = useRef(value);
  const animRef = useRef(null);

  useEffect(() => {
    const prev = prevValueRef.current;
    if (prev !== value && flashOnChange) {
      // Trigger temporary color flash like a Bloomberg/trading terminal
      const isUp = value > prev;
      setFlashClass(isUp ? 'text-emerald-400 bg-emerald-500/20 px-1 rounded transition-colors duration-300' : 'text-rose-400 bg-rose-500/20 px-1 rounded transition-colors duration-300');
      
      const timer = setTimeout(() => {
        setFlashClass('transition-colors duration-700');
      }, 1000);

      // Animate counting up/down
      const startTime = performance.now();
      const startVal = prev;
      const endVal = value;

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = startVal + (endVal - startVal) * ease;
        setDisplayValue(current);

        if (progress < 1) {
          animRef.current = requestAnimationFrame(step);
        } else {
          setDisplayValue(endVal);
        }
      };

      cancelAnimationFrame(animRef.current);
      animRef.current = requestAnimationFrame(step);
      prevValueRef.current = value;

      return () => {
        clearTimeout(timer);
        cancelAnimationFrame(animRef.current);
      };
    } else {
      setDisplayValue(value);
      prevValueRef.current = value;
    }
  }, [value, duration, flashOnChange]);

  const formatted = typeof displayValue === 'number' 
    ? displayValue.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : displayValue;

  return (
    <span className={`font-mono inline-block ${flashClass} ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
