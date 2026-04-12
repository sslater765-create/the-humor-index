import { NextRequest, NextResponse } from 'next/server';
import { getAllShows } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '5');
  const theme = searchParams.get('theme') || 'dark';

  const shows = await getAllShows();
  const top = shows.slice(0, limit);

  const bg = theme === 'light' ? '#FFFFFF' : '#0F0F0F';
  const text = theme === 'light' ? '#1A1A1A' : '#E5E5E5';
  const muted = theme === 'light' ? '#888888' : '#666666';
  const border = theme === 'light' ? '#E5E5E5' : '#2A2A2A';
  const gold = '#E8B931';

  const rows = top.map((s, i) => `
    <tr style="border-bottom:1px solid ${border}">
      <td style="padding:8px 12px;font-family:monospace;color:${i < 3 ? gold : muted};font-size:13px">${i + 1}</td>
      <td style="padding:8px 12px">
        <a href="https://thehumorindex.com/shows/${s.slug}" target="_blank" style="color:${text};text-decoration:none;font-size:14px;font-weight:500">${s.name}</a>
      </td>
      <td style="padding:8px 12px;font-family:monospace;color:${gold};font-size:14px;font-weight:600;text-align:right">${formatIndex(s.humor_index)}</td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:${bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}</style></head>
<body>
<div style="padding:16px;max-width:400px">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
    <span style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:${muted}">Humor Index</span>
    <a href="https://thehumorindex.com" target="_blank" style="font-size:10px;color:${gold};text-decoration:none">thehumorindex.com</a>
  </div>
  <table style="width:100%;border-collapse:collapse">
    <thead>
      <tr style="border-bottom:1px solid ${border}">
        <th style="padding:6px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:${muted};font-weight:normal">#</th>
        <th style="padding:6px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:${muted};font-weight:normal">Show</th>
        <th style="padding:6px 12px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:${muted};font-weight:normal">Score</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="margin-top:8px;text-align:center">
    <a href="https://thehumorindex.com/shows" target="_blank" style="font-size:11px;color:${muted};text-decoration:none">View all rankings →</a>
  </div>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600',
      'X-Frame-Options': 'ALLOWALL',
    },
  });
}
