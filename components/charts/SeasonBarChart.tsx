'use client';
import { useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import { useInViewChart } from '@/hooks/useInViewChart';
import { SeasonScore } from '@/lib/types';
import { relativeColorFn } from '@/lib/scoring';
import ShareButton from '../ui/ShareButton';

Chart.register(...registerables);

interface Props {
  seasons: SeasonScore[];
  showName: string;
}

export default function SeasonBarChart({ seasons, showName }: Props) {
  const bestIdx = useMemo(() => {
    let idx = 0;
    seasons.forEach((s, i) => { if (s.humor_index > seasons[idx].humor_index) idx = i; });
    return idx;
  }, [seasons]);

  const worstIdx = useMemo(() => {
    let idx = 0;
    seasons.forEach((s, i) => { if (s.humor_index < seasons[idx].humor_index) idx = i; });
    return idx;
  }, [seasons]);

  // Best/Worst only make sense with 2+ seasons. For a single-season show the
  // same bar is both best and worst, which stacked the two labels into garble.
  const multi = seasons.length > 1;

  const colorOf = useMemo(() => relativeColorFn(seasons.map(s => s.humor_index)), [seasons]);
  // Bars show each season's distance from the series average, around a zero
  // line. The old chart started its axis near the lowest season, which made a
  // 3-point dip look like a collapse.
  const avg = useMemo(() => seasons.reduce((n, s) => n + s.humor_index, 0) / Math.max(seasons.length, 1), [seasons]);
  const span = useMemo(() => Math.max(2, Math.ceil(Math.max(...seasons.map(s => Math.abs(s.humor_index - avg))) + 0.5)), [seasons, avg]);

  const config = useMemo(() => ({
    type: 'bar' as const,
    data: {
      labels: seasons.map(s => `S${s.season}`),
      datasets: [{
        label: 'Humor Index',
        data: seasons.map(s => +(s.humor_index - avg).toFixed(2)),
        backgroundColor: seasons.map((s, i) => {
          if (multi && i === bestIdx) return '#E8B931CC';
          if (multi && i === worstIdx) return '#666666AA';
          return colorOf(s.humor_index) + '99';
        }),
        borderColor: seasons.map((s, i) => {
          if (multi && i === bestIdx) return '#E8B931';
          if (multi && i === worstIdx) return '#888888';
          return colorOf(s.humor_index);
        }),
        borderWidth: seasons.map((_, i) => (multi && (i === bestIdx || i === worstIdx)) ? 2 : 1),
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
              const label = !multi ? '' : ctx[0].dataIndex === bestIdx ? ' (Best)' : ctx[0].dataIndex === worstIdx ? ' (Worst)' : '';
              return `Season ${s.season}${label}`;
            },
            label: (ctx: any) => {
              const s = seasons[ctx.dataIndex];
              return [
                ` Index: ${s.humor_index.toFixed(1)} (${(ctx.raw as number) >= 0 ? '+' : ''}${(ctx.raw as number).toFixed(1)} vs series average)`,
                ` Best: ${s.best_episode_title}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#8A8A8A', font: { size: 11 } },
          grid: { display: false },
        },
        y: {
          min: -span,
          max: span,
          ticks: { color: '#8A8A8A', font: { size: 11 }, callback: (v: any) => (v > 0 ? `+${v}` : `${v}`) },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    },
    plugins: [{
      id: 'barLabels',
      afterDatasetsDraw(chart: any) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta?.data) return;
        if (!multi) return; // single-season: no Best/Worst labels (avoids overlap)

        // Best label
        const bestBar = meta.data[bestIdx];
        if (bestBar) {
          ctx.save();
          ctx.font = 'bold 10px system-ui, sans-serif';
          ctx.fillStyle = '#E8B931';
          ctx.textAlign = 'center';
          ctx.fillText('BEST', bestBar.x, bestBar.y - 8);
          ctx.restore();
        }

        // Worst label
        const worstBar = meta.data[worstIdx];
        if (worstBar) {
          ctx.save();
          ctx.font = 'bold 10px system-ui, sans-serif';
          ctx.fillStyle = '#888888';
          ctx.textAlign = 'center';
          ctx.fillText('WORST', worstBar.x, worstBar.y + 14);
          ctx.restore();
        }
      },
    }],
  }), [seasons, bestIdx, worstIdx, multi, colorOf, avg, span]);

  const { canvasRef, inViewRef } = useInViewChart(config);

  return (
    <div ref={inViewRef} className="bg-brand-card border border-brand-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">{showName}</p>
          <p className="text-base font-medium text-brand-text-primary">Seasons vs the series average</p>
          <p className="text-xs text-brand-text-muted mt-0.5">Series average {avg.toFixed(1)}. Bars above the line beat it.</p>
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
