'use client';
import { useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import { useInViewChart } from '@/hooks/useInViewChart';
import { EpisodeScore } from '@/lib/types';
import ShareButton from '../ui/ShareButton';

Chart.register(...registerables);

interface Props {
  episodes: EpisodeScore[];
  showName: string;
}

export default function EpisodeArcChart({ episodes, showName }: Props) {
  const config = useMemo(() => ({
    type: 'line' as const,
    data: {
      labels: episodes.map(e => `S${e.season}E${e.episode_number}`),
      datasets: [{
        label: 'Humor Index',
        data: episodes.map(e => e.humor_index),
        borderColor: '#E8B931',
        backgroundColor: 'rgba(232,185,49,0.06)',
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#E8B931',
        tension: 0.3,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: 'easeInOutQuart' as const },
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
              const ep = episodes[ctx[0].dataIndex];
              return `S${ep.season}E${ep.episode_number} — ${ep.title}`;
            },
            label: (ctx: any) => ` Humor Index: ${(ctx.raw as number).toFixed(1)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#666666',
            font: { size: 10 },
            callback: (_: any, i: number) => {
              const ep = episodes[i];
              return ep?.episode_number === 1 ? `S${ep.season}` : '';
            },
            autoSkip: false,
            maxRotation: 0,
          },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          min: 40,
          max: 100,
          ticks: { color: '#666666', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    },
  }), [episodes]);

  const { canvasRef, inViewRef } = useInViewChart(config);

  return (
    <div ref={inViewRef} className="bg-brand-card border border-brand-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">{showName}</p>
          <p className="text-base font-medium text-brand-text-primary">Humor Index — every episode</p>
        </div>
        <ShareButton targetId="arc-chart-wrap" filename={`${showName}-episode-arc`} />
      </div>
      <div id="arc-chart-wrap" className="relative w-full h-72">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Line chart of ${showName} Humor Index scores across all episodes`}
        />
      </div>
    </div>
  );
}
