import { ShowFormat } from '@/lib/types';
import { FORMAT_LABELS } from '@/lib/scoring';

interface Props {
  format: ShowFormat;
}

const FORMAT_COLORS: Record<ShowFormat, string> = {
  single_camera: 'bg-brand-teal/20 text-brand-teal border-brand-teal/30',
  multi_camera_live: 'bg-brand-blue/20 text-brand-blue border-brand-blue/30',
  multi_camera_sweetened: 'bg-brand-purple/20 text-brand-purple border-brand-purple/30',
  hybrid: 'bg-brand-coral/20 text-brand-coral border-brand-coral/30',
};

export default function FormatBadge({ format }: Props) {
  return (
    <span className={`inline-block text-xs border rounded-full px-2.5 py-0.5 ${FORMAT_COLORS[format]}`}>
      {FORMAT_LABELS[format]}
    </span>
  );
}
