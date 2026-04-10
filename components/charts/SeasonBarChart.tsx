'use client';
import { useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import { useInViewChart } from '@/hooks/useInViewChart';
import { SeasonScore } from '@/lib/types';
import { scoreToColor } from '@/lib/scoring';
import ShareButton from '../ui/ShareButton';

Chart.register(...registerables);

interface Props {
  seasons: SeasonScore[];
  showName: string;
}

export default function SeasonBarChart({ seasons, showName }: Props) {
  const config = useMemo(() => ({
    type: 'bar' as const,
    data: {
      labels: seasons.map(s => `S${s.season}`),
      datasets: [{
        label: 'Humor Index',
        data: seasons.map(s => s.humor_index),
        backgroundColor: seasons.map(s => scoreToColor(s.humor_index) + '99'),
        borderColor: seasons.map(s => scoreToColor(s.humor_index)),
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900, easing: 'easeInOutQuart' as const },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1A1A1A',
          borderColor: '#2D2D2D',
          borderWidth: 1,
          titleColor: '#F5F5F5',
          bodyColor: '#A0A0A0',
          callbacks: {
            title: (ctx: any) => {
              const s = seasons[ctx[0].dataIndex];
              return `Season ${s.season}`;
            },
            label: (ctx: any) => {
              const s = seasons[ctx[0].dataIndex];
              return [
                ` Index: ${(ctx.raw as number).toFixed(1)}`,
                ` Best: ${s.best_episode_title}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#666666', font: { size: 11 } },
          grid: { display: false },
        },
        y: {
          min: 40,
          max: 100,
          ticks: { color: '#666666', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    },
  }), [seasons]);

  const { canvasRef, inViewRef } = useInViewChart(config);

  return (
    <div ref={inViewRef} className="bg-brand-card border border-brand-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">{showName}</p>
          <p className="text-base font-medium text-brand-text-primary">Season Averages</p>
        </div>
        <ShareButton targetId="season-bar-wrap" filename={`${showName}-seasons`} />
      </div>
      <div id="season-bar-wrap" className="relative w-full h-56">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Bar chart of ${showName} season Humor Index scores`}
        />
      </div>
    </div>
  );
}
