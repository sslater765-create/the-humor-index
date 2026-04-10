import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { Chart, ChartConfiguration } from 'chart.js';

export function useInViewChart(config: ChartConfiguration | null) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { ref: inViewRef, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (!inView || !canvasRef.current || !config) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, config);
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [inView, config]);

  return { canvasRef, inViewRef };
}
