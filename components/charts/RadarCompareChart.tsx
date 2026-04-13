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
  return Math.max(0, Math.min(100, Math.round(((val - min) / (max - min)) * 100)));
}

export default function RadarCompareChart({ showA, showB }: Props) {
  const config = useMemo(() => {
    const dimensions = ['JPM', 'Craft', 'Impact', 'Humor Index', 'IMDb', 'WAR / Ep'];
    const dataA = [
      normalize(showA.avg_jpm, 1.5, 4.0),
      normalize(showA.avg_craft, 6.0, 8.0),
      normalize(showA.avg_impact, 6.0, 8.0),
      normalize(showA.humor_index, 60, 100),
      normalize(showA.avg_imdb_rating || 7.5, 6.5, 9.0),
      normalize(showA.war_per_episode || 0, 0, 15),
    ];
    const dataB = [
      normalize(showB.avg_jpm, 1.5, 4.0),
      normalize(showB.avg_craft, 6.0, 8.0),
      normalize(showB.avg_impact, 6.0, 8.0),
      normalize(showB.humor_index, 60, 100),
      normalize(showB.avg_imdb_rating || 7.5, 6.5, 9.0),
      normalize(showB.war_per_episode || 0, 0, 15),
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
            backgroundColor: 'rgba(232,185,49,0.15)',
            borderWidth: 2,
            pointBackgroundColor: '#E8B931',
            pointRadius: 4,
          },
          {
            label: showB.name,
            data: dataB,
            borderColor: '#378ADD',
            backgroundColor: 'rgba(55,138,221,0.15)',
            borderWidth: 2,
            pointBackgroundColor: '#378ADD',
            pointRadius: 4,
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
            callbacks: {
              label: (ctx: any) => {
                const show = ctx.datasetIndex === 0 ? showA : showB;
                const vals = [
                  `${show.avg_jpm.toFixed(1)} JPM`,
                  `${show.avg_craft.toFixed(1)} Craft`,
                  `${show.avg_impact.toFixed(1)} Impact`,
                  `${show.humor_index.toFixed(1)} HI`,
                  `${(show.avg_imdb_rating || 0).toFixed(1)} IMDb`,
                  `${(show.war_per_episode || 0).toFixed(1)} WAR/E`,
                ];
                return ` ${vals[ctx.dataIndex]}`;
              },
            },
          },
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { display: false, stepSize: 25 },
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
      <div id="radar-chart-wrap" className="relative w-full h-80">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Radar chart comparing ${showA.name} and ${showB.name}`}
        />
      </div>
    </div>
  );
}
