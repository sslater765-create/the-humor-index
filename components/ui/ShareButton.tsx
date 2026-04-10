'use client';

interface Props {
  targetId: string;
  filename: string;
}

export default function ShareButton({ targetId, filename }: Props) {
  async function handleShare() {
    const { default: html2canvas } = await import('html2canvas');
    const el = document.getElementById(targetId);
    if (!el) return;
    const canvas = await html2canvas(el, {
      backgroundColor: '#1A1A1A',
      scale: 2,
      logging: false,
    });
    const ctx = canvas.getContext('2d')!;
    ctx.font = '500 13px Inter';
    ctx.fillStyle = 'rgba(232,185,49,0.6)';
    ctx.fillText('thehumorindex.com', canvas.width - 220, canvas.height - 20);
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <button
      onClick={handleShare}
      className="text-xs text-brand-text-muted hover:text-brand-gold border border-brand-border hover:border-brand-gold rounded-lg px-3 py-1.5 transition-all"
    >
      Share ↗
    </button>
  );
}
