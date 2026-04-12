import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text') || '';
  const craft = searchParams.get('craft') || '0';
  const impact = searchParams.get('impact') || '0';
  const show = searchParams.get('show') || '';
  const episode = searchParams.get('episode') || '';
  const types = (searchParams.get('types') || '').split(',').filter(Boolean);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0F0F0F',
          padding: '60px 80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top: show + episode label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#E8B931', fontSize: '16px', letterSpacing: '3px', textTransform: 'uppercase' as const, display: 'flex' }}>
              {show}
            </span>
            <span style={{ color: '#666', fontSize: '14px', marginTop: '4px', display: 'flex' }}>
              {episode}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
            {[40, 60, 80, 55, 35].map((h, i) => (
              <div key={i} style={{ width: '10px', height: `${h * 0.5}px`, backgroundColor: '#E8B931', borderRadius: '2px' }} />
            ))}
          </div>
        </div>

        {/* Middle: the joke text */}
        <div
          style={{
            fontSize: text.length > 150 ? '28px' : text.length > 80 ? '34px' : '42px',
            color: '#FFFFFF',
            lineHeight: 1.4,
            fontWeight: 500,
            maxHeight: '280px',
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          {'\u201C'}{text}{'\u201D'}
        </div>

        {/* Bottom: scores + tags */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '36px', fontWeight: 700, color: '#378ADD', display: 'flex' }}>
                {craft}
              </span>
              <span style={{ fontSize: '12px', color: '#666', letterSpacing: '2px', textTransform: 'uppercase' as const, display: 'flex' }}>
                CRAFT
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '36px', fontWeight: 700, color: '#1D9E75', display: 'flex' }}>
                {impact}
              </span>
              <span style={{ fontSize: '12px', color: '#666', letterSpacing: '2px', textTransform: 'uppercase' as const, display: 'flex' }}>
                IMPACT
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {types.slice(0, 3).map((t, i) => (
              <span
                key={i}
                style={{
                  fontSize: '12px',
                  color: '#888',
                  border: '1px solid #333',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  display: 'flex',
                }}
              >
                {t.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
