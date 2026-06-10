'use client';
import { useState } from 'react';

export default function CopyBlock({ code, label = 'Copy' }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <pre className="bg-brand-surface border border-brand-border rounded-xl p-4 pr-20 overflow-x-auto text-xs text-brand-text-secondary font-mono leading-relaxed whitespace-pre-wrap break-all">
        {code}
      </pre>
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className={`absolute top-2.5 right-2.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${copied ? 'text-brand-gold border-brand-gold' : 'text-brand-text-muted border-brand-border hover:text-brand-gold hover:border-brand-gold'}`}
      >
        {copied ? 'Copied!' : label}
      </button>
    </div>
  );
}
