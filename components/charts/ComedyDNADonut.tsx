'use client';
import { useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import { useInViewChart } from '@/hooks/useInViewChart';
import { JOKE_TYPE_LABELS } from '@/lib/scoring';
import { JokeType } from '@/lib/types';
import ShareButton from '../ui/ShareButton';

Chart.register(...registerables);

const DONUT_COLORS = [
  '#E8B931', '#378ADD', '#1D9E75', '#D85A30',
  '#7F77DD', '#D4537E', '#E24B4A', '#A0A0A0',
  '#BA7517', '#5F9EA0', '#8B4513', '#2F4F4F',
];

interface Props {
  distribution: Partial<Record<JokeType, number>>;
  showName: string;
}

export default function ComedyDNADonut({ distribution, showName }: Props) {
  const entries = useMemo(
    () =>
      Object.entries(distribution)
        .filter(([, v]) => (v ?? 0) > 0)
        .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0)) as [JokeType, number][],
    [distribution]
  );

  const total = entries.reduce((s, [, v]) => s + v, 0);

  const config = useMemo(() => ({
    type: 'doughnut' as const,
    data: {
      labels: entries.map(([k]) => JOKE_TYPE_LABELS[k]),
      datasets: [{
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map((_, i) => DONUT_COLORS[i % DONUT_COLORS.length] + 'CC'),
        borderColor: entries.map((_, i) => DONUT_COLORS[i % DONUT_COLORS.length]),
        borderWidth: 1,
        hoverOffset: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '64%',
      animation: { duration: 1000, easing: 'easeInOutQuart' as const },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1A1A1A',
          borderColor: '#2D2D2D',
          borderWidth: 1,
          titleColor: '#F5F5F5',
          bodyColor: '#A0A0A0',
          callbacks: {
            label: (ctx: any) => {
              const pct = ((ctx.raw / total) * 100).toFixed(1);
              return ` ${pct}%`;
            },
          },
        },
      },
    },
  }), [entries, total]);

  const { canvasRef, inViewRef } = useInViewChart(config);

  return (
    <div ref={inViewRef} className="bg-brand-card border border-brand-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">{showName}</p>
          <p className="text-base font-medium text-brand-text-primary">Comedy DNA</p>
        </div>
        <ShareButton targetId="donut-chart-wrap" filename={`${showName}-comedy-dna`} />
      </div>
      <div id="donut-chart-wrap" className="flex flex-col sm:flex-row gap-6">
        <div className="relative w-full sm:w-56 h-56 shrink-0">
          <canvas ref={canvasRef} role="img" aria-label={`Comedy DNA donut for ${showName}`} />
        </div>
        <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5 content-start">
          {entries.map(([k, v], i) => (
            <div key={k} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
              />
              <span className="text-xs text-brand-text-secondary truncate">{JOKE_TYPE_LABELS[k]}</span>
              <span className="font-mono text-xs text-brand-text-muted ml-auto">
                {((v / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
