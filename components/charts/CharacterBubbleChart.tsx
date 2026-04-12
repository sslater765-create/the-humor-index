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

export default function CharacterBubbleChart({ characters, showName }: Props) {
  const sorted = useMemo(
    () => [...characters].sort((a, b) => b.total_jokes - a.total_jokes),
    [characters]
  );

  // Scale bubble radius: sqrt of joke count, normalized to reasonable range
  const maxJokes = Math.max(...sorted.map(c => c.total_jokes));

  const config = useMemo(() => ({
    type: 'bubble' as const,
    data: {
      datasets: sorted.map((c, i) => ({
        label: c.name,
        data: [{
          x: c.avg_craft,
          y: c.avg_impact,
          r: 6 + Math.sqrt(c.total_jokes / maxJokes) * 22,
        }],
        backgroundColor: BRAND_COLORS[i % BRAND_COLORS.length] + '66',
        borderColor: BRAND_COLORS[i % BRAND_COLORS.length],
        borderWidth: 1.5,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900 },
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
          labels: {
            color: '#A0A0A0',
            font: { size: 11 },
            boxWidth: 10,
            padding: 14,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          backgroundColor: '#1A1A1A',
          borderColor: '#2D2D2D',
          borderWidth: 1,
          titleColor: '#F5F5F5',
          bodyColor: '#A0A0A0',
          padding: 12,
          callbacks: {
            label: (ctx: any) => {
              const c = sorted[ctx.datasetIndex];
              return [
                ` ${c.total_jokes.toLocaleString()} jokes`,
                ` Craft: ${c.avg_craft.toFixed(1)}`,
                ` Impact: ${c.avg_impact.toFixed(1)}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Avg Craft Score', color: '#666666', font: { size: 11 } },
          min: Math.floor(Math.min(...sorted.map(c => c.avg_craft)) * 10 - 2) / 10,
          max: Math.ceil(Math.max(...sorted.map(c => c.avg_craft)) * 10 + 2) / 10,
          ticks: { color: '#666666', font: { size: 10 }, stepSize: 0.2 },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          title: { display: true, text: 'Avg Impact Score', color: '#666666', font: { size: 11 } },
          min: Math.floor(Math.min(...sorted.map(c => c.avg_impact)) * 10 - 2) / 10,
          max: Math.ceil(Math.max(...sorted.map(c => c.avg_impact)) * 10 + 2) / 10,
          ticks: { color: '#666666', font: { size: 10 }, stepSize: 0.2 },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    },
  }), [sorted, maxJokes]);

  const { canvasRef, inViewRef } = useInViewChart(config);

  return (
    <div ref={inViewRef} className="bg-brand-card border border-brand-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">{showName}</p>
          <p className="text-base font-medium text-brand-text-primary">Character Comedy Profiles</p>
          <p className="text-xs text-brand-text-muted mt-0.5">Craft vs Impact — bubble size = total jokes</p>
        </div>
        <ShareButton targetId="bubble-chart-wrap" filename={`${showName}-characters`} />
      </div>
      <div id="bubble-chart-wrap" className="relative w-full h-[420px] sm:h-[480px]">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Bubble chart of ${showName} character comedy profiles: craft vs impact`}
        />
      </div>
    </div>
  );
}
