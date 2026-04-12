'use client';
import { useEffect, useRef } from 'react';

interface Props {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

// Set your AdSense publisher ID in .env.local as NEXT_PUBLIC_ADSENSE_ID
const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_ID || '';

export default function AdSlot({ slot, format = 'auto', className = '' }: Props) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!PUBLISHER_ID) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded
    }
  }, []);

  if (!PUBLISHER_ID) {
    // Don't render anything if no AdSense ID configured
    return null;
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        ref={adRef}
      />
    </div>
  );
}
