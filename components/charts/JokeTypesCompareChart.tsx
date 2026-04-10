'use client';
import { useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import { useInViewChart } from '@/hooks/useInViewChart';
import { JokeType } from '@/lib/types';
import { JOKE_TYPE_LABELS } from '@/lib/scoring';
import ShareButton from '../ui/ShareButton';

Chart.register(...registerables);

interface Props {
  showAName: string;
  showBName: string;
  distA: Partial<Record<JokeType, number>>;
  distB: Partial<Record<JokeType, number>>;
}

export default function JokeTypesCompareChart({ showAName, showBName, distA, distB }: Props) {
  const allTypes = useMemo(() => {
    const types = new Set([...Object.keys(distA), ...Object.keys(distB)]) as Set<JokeType>;
    return Array.from(types);
  }, [distA, distB]);

  const totalA = useMemo(() => Object.values(distA).reduce((s, v) => s + (v ?? 0), 0), [distA]);
  const totalB = useMemo(() => Object.values(distB).reduce((s, v) => s + (v ?? 0), 0), [distB]);

  const config = useMemo(() => ({
    type: 'bar' as const,
    data: {
      labels: allTypes.map(t => JOKE_TYPE_LABELS[t]),
      datasets: [
        {
          label: showAName,
          data: allTypes.map(t => totalA > 0 ? Math.round(((distA[t] ?? 0) / totalA) * 100) : 0),
          backgroundColor: 'rgba(232,185,49,0.6)',
          borderColor: '#E8B931',
          borderWidth: 1,
          borderRadius: 3,
        },
        {
          label: showBName,
          data: allTypes.map(t => totalB > 0 ? Math.round(((distB[t] ?? 0) / totalB) * 100) : 0),
          backgroundColor: 'rgba(55,138,221,0.6)',
          borderColor: '#378ADD',
          borderWidth: 1,
          borderRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900 },
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
          labels: { color: '#A0A0A0', font: { size: 11 }, padding: 14 },
        },
        tooltip: {
          backgroundColor: '#1A1A1A',
          borderColor: '#2D2D2D',
          borderWidth: 1,
          titleColor: '#F5F5F5',
          bodyColor: '#A0A0A0',
          callbacks: {
            label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw}%`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#666666', font: { size: 9 }, maxRotation: 40 },
          grid: { display: false },
        },
        y: {
          ticks: { color: '#666666', font: { size: 10 }, callback: (v: any) => `${v}%` },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    },
  }), [allTypes, distA, distB, showAName, showBName, totalA, totalB]);

  const { canvasRef, inViewRef } = useInViewChart(config);

  return (
    <div ref={inViewRef} className="bg-brand-card border border-brand-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">Comparison</p>
          <p className="text-base font-medium text-brand-text-primary">Joke Type Breakdown</p>
        </div>
        <ShareButton targetId="joke-types-wrap" filename="joke-types-comparison" />
      </div>
      <div id="joke-types-wrap" className="relative w-full h-72">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Grouped bar chart comparing joke types for ${showAName} and ${showBName}`}
        />
      </div>
    </div>
  );
}
