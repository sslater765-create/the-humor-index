import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'The Humor Index';
  const score = searchParams.get('score') || '';
  const subtitle = searchParams.get('subtitle') || '';
  // type param reserved for future use: 'default', 'episode', 'compare'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          backgroundColor: '#0F0F0F',
          padding: '60px 80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Bar chart icon */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '40px', alignItems: 'flex-end' }}>
          {[40, 60, 80, 55, 35].map((h, i) => (
            <div
              key={i}
              style={{
                width: '14px',
                height: `${h}px`,
                backgroundColor: '#E8B931',
                borderRadius: '2px',
              }}
            />
          ))}
          <span
            style={{
              color: '#666',
              fontSize: '14px',
              letterSpacing: '4px',
              marginLeft: '16px',
              textTransform: 'uppercase' as const,
            }}
          >
            THE HUMOR INDEX
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 40 ? '42px' : '52px',
            fontWeight: 600,
            color: '#FFFFFF',
            lineHeight: 1.2,
            maxWidth: score ? '700px' : '1000px',
            display: 'flex',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontSize: '22px',
              color: '#888',
              marginTop: '16px',
              display: 'flex',
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Score badge */}
        {score && (
          <div
            style={{
              position: 'absolute',
              right: '80px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: '96px',
                fontWeight: 700,
                color: '#E8B931',
                fontFamily: 'monospace',
                lineHeight: 1,
                display: 'flex',
              }}
            >
              {score}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: '#666',
                letterSpacing: '3px',
                textTransform: 'uppercase' as const,
                marginTop: '8px',
                display: 'flex',
              }}
            >
              HUMOR INDEX
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '80px',
            right: '80px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#444', fontSize: '14px', display: 'flex' }}>
            thehumorindex.com
          </span>
          <span style={{ color: '#444', fontSize: '14px', display: 'flex' }}>
            Comedy Analytics
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
