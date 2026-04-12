'use client';
import { useState, useEffect } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-20 right-6 z-50 w-11 h-11 rounded-full bg-brand-card border border-brand-border text-brand-text-muted hover:text-brand-gold hover:border-brand-gold transition-all shadow-lg active:scale-95 flex items-center justify-center"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
}
