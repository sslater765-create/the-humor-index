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

const MAX_SCREEN_TIME = 150;

function normalizeR(st: number): number {
  return 8 + (st / MAX_SCREEN_TIME) * 16;
}

export default function CharacterBubbleChart({ characters, showName }: Props) {
  const config = useMemo(() => ({
    type: 'bubble' as const,
    data: {
      datasets: characters.map((c, i) => ({
        label: c.name,
        data: [{
          x: c.avg_craft,
          y: c.jpm,
          r: normalizeR(c.screen_time_minutes),
        }],
        backgroundColor: BRAND_COLORS[i % BRAND_COLORS.length] + '55',
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
          position: 'right' as const,
          labels: {
            color: '#A0A0A0',
            font: { size: 11 },
            boxWidth: 10,
            padding: 12,
          },
        },
        tooltip: {
          backgroundColor: '#1A1A1A',
          borderColor: '#2D2D2D',
          borderWidth: 1,
          titleColor: '#F5F5F5',
          bodyColor: '#A0A0A0',
          callbacks: {
            label: (ctx: any) => {
              const c = characters[ctx.datasetIndex];
              return [
                ` Craft: ${c.avg_craft.toFixed(1)}`,
                ` JPM: ${c.jpm.toFixed(1)}`,
                ` Screen time: ${c.screen_time_minutes}m`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Craft Score', color: '#666666', font: { size: 11 } },
          min: 5,
          max: 10,
          ticks: { color: '#666666', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          title: { display: true, text: 'Jokes Per Minute', color: '#666666', font: { size: 11 } },
          min: 1,
          ticks: { color: '#666666', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    },
  }), [characters]);

  const { canvasRef, inViewRef } = useInViewChart(config);

  return (
    <div ref={inViewRef} className="bg-brand-card border border-brand-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">{showName}</p>
          <p className="text-base font-medium text-brand-text-primary">Character Comedy Profiles</p>
          <p className="text-xs text-brand-text-muted mt-0.5">Bubble size = screen time</p>
        </div>
        <ShareButton targetId="bubble-chart-wrap" filename={`${showName}-characters`} />
      </div>
      <div id="bubble-chart-wrap" className="relative w-full h-[400px] sm:h-[450px]">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Bubble chart of ${showName} character comedy profiles`}
        />
      </div>
    </div>
  );
}
