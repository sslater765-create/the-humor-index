'use client';
import { useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import { useInViewChart } from '@/hooks/useInViewChart';
import { ShowScore } from '@/lib/types';
import ShareButton from '../ui/ShareButton';

Chart.register(...registerables);

interface Props {
  showA: ShowScore;
  showB: ShowScore;
}

function normalize(val: number, min: number, max: number): number {
  return Math.round(((val - min) / (max - min)) * 100);
}

export default function RadarCompareChart({ showA, showB }: Props) {
  const config = useMemo(() => {
    const dimensions = ['JPM', 'Craft', 'Impact', 'Consistency', 'Peak Score', 'Rewatchability'];
    const dataA = [
      normalize(showA.avg_jpm, 2, 8),
      normalize(showA.avg_craft, 5, 10),
      normalize(showA.avg_impact, 5, 10),
      80,
      normalize(showA.humor_index, 50, 100),
      75,
    ];
    const dataB = [
      normalize(showB.avg_jpm, 2, 8),
      normalize(showB.avg_craft, 5, 10),
      normalize(showB.avg_impact, 5, 10),
      78,
      normalize(showB.humor_index, 50, 100),
      72,
    ];

    return {
      type: 'radar' as const,
      data: {
        labels: dimensions,
        datasets: [
          {
            label: showA.name,
            data: dataA,
            borderColor: '#E8B931',
            backgroundColor: 'rgba(232,185,49,0.1)',
            borderWidth: 1.5,
            pointBackgroundColor: '#E8B931',
            pointRadius: 3,
          },
          {
            label: showB.name,
            data: dataB,
            borderColor: '#378ADD',
            backgroundColor: 'rgba(55,138,221,0.1)',
            borderWidth: 1.5,
            pointBackgroundColor: '#378ADD',
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1000 },
        plugins: {
          legend: {
            display: true,
            position: 'bottom' as const,
            labels: { color: '#A0A0A0', font: { size: 11 }, padding: 16 },
          },
          tooltip: {
            backgroundColor: '#1A1A1A',
            borderColor: '#2D2D2D',
            borderWidth: 1,
            titleColor: '#F5F5F5',
            bodyColor: '#A0A0A0',
          },
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { display: false },
            grid: { color: 'rgba(255,255,255,0.08)' },
            pointLabels: { color: '#A0A0A0', font: { size: 11 } },
            angleLines: { color: 'rgba(255,255,255,0.08)' },
          },
        },
      },
    };
  }, [showA, showB]);

  const { canvasRef, inViewRef } = useInViewChart(config);

  return (
    <div ref={inViewRef} className="bg-brand-card border border-brand-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">Head-to-Head</p>
          <p className="text-base font-medium text-brand-text-primary">
            {showA.name} vs {showB.name}
          </p>
        </div>
        <ShareButton targetId="radar-chart-wrap" filename="comparison-radar" />
      </div>
      <div id="radar-chart-wrap" className="relative w-full h-72">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Radar chart comparing ${showA.name} and ${showB.name}`}
        />
      </div>
    </div>
  );
}
