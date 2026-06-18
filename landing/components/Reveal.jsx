'use client';
import { useReveal } from './useReveal';

export default function Reveal({ children, delay = 0, className = '' }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity .65s cubic-bezier(.22,1,.36,1) ${delay}ms, transform .65s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
