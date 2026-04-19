import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Per-episode scorecard OG image (1200x630).
 *
 * Query params (all optional except show + title):
 *   show       — show name, e.g. "Seinfeld"
 *   title      — episode title, e.g. "The Contest"
 *   season     — season number
 *   episode    — episode number
 *   score      — humor_index 0–100
 *   tier       — tier label (Elite/Great/Solid/Mixed/Weak)
 *   craft      — avg_craft 0–10
 *   impact     — avg_impact 0–10
 *   jokes      — total_jokes count
 *   quote      — a top joke (optional)
 *   speaker    — who delivered the quote
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const show = searchParams.get('show') ?? 'The Humor Index';
  const title = searchParams.get('title') ?? '';
  const season = searchParams.get('season');
  const episode = searchParams.get('episode');
  const score = searchParams.get('score');
  const tier = searchParams.get('tier');
  const craft = searchParams.get('craft');
  const impact = searchParams.get('impact');
  const jokes = searchParams.get('jokes');
  const quote = searchParams.get('quote');
  const speaker = searchParams.get('speaker');

  const tierColor = (() => {
    switch ((tier ?? '').toLowerCase()) {
      case 'elite': return '#E8B931';
      case 'great': return '#34D399';
      case 'solid': return '#38BDF8';
      case 'mixed': return '#FBBF24';
      case 'weak':  return '#FB7185';
      default:      return '#E8B931';
    }
  })();

  const seasonEp = season && episode
    ? `S${String(season).padStart(2, '0')}E${String(episode).padStart(2, '0')}`
    : '';

  // Cap quote length for layout
  const trimmedQuote = quote && quote.length > 140 ? quote.slice(0, 137) + '…' : quote;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0F0F0F',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle top accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: tierColor,
            display: 'flex',
          }}
        />

        {/* Main body */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            padding: '60px 80px 40px',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Header row: logo + seasonEp + show */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
              {[40, 60, 80, 55, 35].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: '10px',
                    height: `${h * 0.7}px`,
                    backgroundColor: '#E8B931',
                    borderRadius: '2px',
                    display: 'flex',
                  }}
                />
              ))}
              <span
                style={{
                  color: '#888',
                  fontSize: '14px',
                  letterSpacing: '4px',
                  marginLeft: '14px',
                  textTransform: 'uppercase' as const,
                  display: 'flex',
                }}
              >
                THE HUMOR INDEX
              </span>
            </div>

            {seasonEp && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    color: '#888',
                    fontSize: '20px',
                    letterSpacing: '1px',
                    fontFamily: 'monospace',
                    display: 'flex',
                  }}
                >
                  {seasonEp}
                </span>
                <span style={{ color: '#333', fontSize: '20px', display: 'flex' }}>·</span>
                <span
                  style={{
                    color: '#CCCCCC',
                    fontSize: '20px',
                    letterSpacing: '0.5px',
                    display: 'flex',
                  }}
                >
                  {show}
                </span>
              </div>
            )}
          </div>

          {/* Center: title + (optional quote) on left, score gauge on right */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '40px',
              flex: 1,
              paddingTop: '30px',
              paddingBottom: '20px',
            }}
          >
            {/* Left column */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                maxWidth: '720px',
              }}
            >
              <div
                style={{
                  fontSize: title.length > 38 ? '52px' : '68px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                  display: 'flex',
                  letterSpacing: '-0.02em',
                }}
              >
                {title ? `"${title}"` : show}
              </div>

              {trimmedQuote && (
                <div
                  style={{
                    marginTop: '28px',
                    fontSize: '20px',
                    color: '#BBBBBB',
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                    display: 'flex',
                  }}
                >
                  {`“${trimmedQuote}”`}
                </div>
              )}

              {speaker && (
                <div
                  style={{
                    marginTop: '10px',
                    fontSize: '14px',
                    color: '#777',
                    letterSpacing: '2px',
                    textTransform: 'uppercase' as const,
                    display: 'flex',
                  }}
                >
                  — {speaker}
                </div>
              )}
            </div>

            {/* Right column: score card */}
            {score && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '260px',
                  padding: '32px 24px',
                  border: `2px solid ${tierColor}55`,
                  borderRadius: '20px',
                  backgroundColor: '#151515',
                }}
              >
                {tier && (
                  <div
                    style={{
                      fontSize: '12px',
                      letterSpacing: '4px',
                      color: tierColor,
                      fontWeight: 600,
                      textTransform: 'uppercase' as const,
                      marginBottom: '8px',
                      display: 'flex',
                    }}
                  >
                    {tier}
                  </div>
                )}
                <div
                  style={{
                    fontSize: '112px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: tierColor,
                    lineHeight: 1,
                    display: 'flex',
                  }}
                >
                  {score}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    letterSpacing: '3px',
                    color: '#666',
                    textTransform: 'uppercase' as const,
                    marginTop: '12px',
                    display: 'flex',
                  }}
                >
                  HUMOR INDEX
                </div>

                {(craft || impact || jokes) && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '18px',
                      marginTop: '20px',
                      paddingTop: '20px',
                      borderTop: '1px solid #2A2A2A',
                      width: '100%',
                      justifyContent: 'space-around',
                    }}
                  >
                    {craft && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '20px', color: '#FFFFFF', fontFamily: 'monospace', display: 'flex' }}>
                          {craft}
                        </span>
                        <span style={{ fontSize: '10px', color: '#666', letterSpacing: '2px', textTransform: 'uppercase' as const, display: 'flex', marginTop: '4px' }}>
                          CRAFT
                        </span>
                      </div>
                    )}
                    {impact && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '20px', color: '#FFFFFF', fontFamily: 'monospace', display: 'flex' }}>
                          {impact}
                        </span>
                        <span style={{ fontSize: '10px', color: '#666', letterSpacing: '2px', textTransform: 'uppercase' as const, display: 'flex', marginTop: '4px' }}>
                          IMPACT
                        </span>
                      </div>
                    )}
                    {jokes && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '20px', color: '#FFFFFF', fontFamily: 'monospace', display: 'flex' }}>
                          {jokes}
                        </span>
                        <span style={{ fontSize: '10px', color: '#666', letterSpacing: '2px', textTransform: 'uppercase' as const, display: 'flex', marginTop: '4px' }}>
                          JOKES
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #2A2A2A',
              paddingTop: '16px',
            }}
          >
            <span style={{ color: '#555', fontSize: '14px', display: 'flex' }}>
              thehumorindex.com
            </span>
            <span style={{ color: '#555', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' as const, display: 'flex' }}>
              Comedy Analytics
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
