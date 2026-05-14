'use client';
import { useEffect } from 'react';
import { trackCompareShows } from '@/lib/analytics';

/**
 * Client component dropped inside the server-rendered compare page so that
 * navigating to a compare URL fires the `compare_shows` GA event once.
 */
export default function CompareViewTracker({ showA, showB }: { showA: string; showB: string }) {
  useEffect(() => {
    trackCompareShows(showA, showB);
  }, [showA, showB]);
  return null;
}
