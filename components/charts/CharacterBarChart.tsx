'use client';
import { useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import { useInViewChart } from '@/hooks/useInViewChart';
import { CharacterStats } from '@/lib/types';
import { BRAND_COLORS } from '@/lib/scoring';
import ShareButton from '../ui/ShareButton';

Chart.register(...registerables);

interface Props {
  characters: CharacterStats[];
  showName: string;
}

export default function CharacterBarChart({ characters, showName }: Props) {
  const sorted = useMemo(
    () => [...characters].sort((a, b) => b.total_jokes - a.total_jokes),
    [characters]
  );

  const config = useMemo(() => ({
    type: 'bar' as const,
    data: {
      labels: sorted.map(c => c.name),
      datasets: [{
        label: 'Total Jokes',
        data: sorted.map(c => c.total_jokes),
        backgroundColor: sorted.map((_, i) => BRAND_COLORS[i % BRAND_COLORS.length] + '77'),
        borderColor: sorted.map((_, i) => BRAND_COLORS[i % BRAND_COLORS.length]),
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: {
      indexAxis: 'y' as const,
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1A1A1A',
          borderColor: '#2D2D2D',
          borderWidth: 1,
          titleColor: '#F5F5F5',
          bodyColor: '#A0A0A0',
          callbacks: {
            label: (ctx: any) => ` ${ctx.raw} jokes`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#666666', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          ticks: { color: '#A0A0A0', font: { size: 11 } },
          grid: { display: false },
        },
      },
    },
  }), [sorted]);

  const { canvasRef, inViewRef } = useInViewChart(config);

  return (
    <div ref={inViewRef} className="bg-brand-card border border-brand-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">{showName}</p>
          <p className="text-base font-medium text-brand-text-primary">Total Jokes by Character</p>
        </div>
        <ShareButton targetId="char-bar-wrap" filename={`${showName}-joke-counts`} />
      </div>
      <div
        id="char-bar-wrap"
        className="relative w-full"
        style={{ height: `${sorted.length * 44 + 20}px`, minHeight: '180px' }}
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Bar chart of ${showName} joke counts by character`}
        />
      </div>
    </div>
  );
}
