import { describe, it, expect } from 'vitest';
import { scoreToColor, scoreToGrade, formatIndex, formatJPM } from '@/lib/scoring';
import { getTier, sameTier, tierIsUncertain } from '@/lib/tiers';
import { archetypeBySlug, ARCHES, tileText } from '@/lib/comedyDna';
import { canonical } from '@/lib/seo';        // proves the re-export works
import { canonical as canon } from '@/lib/site';

describe('scoring display helpers', () => {
  it('formatIndex rounds to one decimal', () => {
    expect(formatIndex(79.36)).toBe('79.4');
    expect(formatIndex(79.34)).toBe('79.3');
    expect(formatIndex(70)).toBe('70.0');
    expect(formatIndex(84.4)).toBe('84.4');
  });
  it('formatJPM rounds to one decimal', () => {
    expect(formatJPM(3)).toBe('3.0');
    expect(formatJPM(1.84)).toBe('1.8');
  });
  it('scoreToColor buckets by band boundary', () => {
    expect(scoreToColor(90)).toBe('#E8B931');
    expect(scoreToColor(85)).toBe('#E8B931');
    expect(scoreToColor(84.9)).toBe('#BA7517');
    expect(scoreToColor(75)).toBe('#BA7517');
    expect(scoreToColor(70)).toBe('#378ADD');
    expect(scoreToColor(60)).toBe('#888780');
    expect(scoreToColor(50)).toBe('#5F5E5A');
  });
  it('scoreToGrade maps to letter grades', () => {
    expect(scoreToGrade(92)).toBe('S');
    expect(scoreToGrade(85)).toBe('A+');
    expect(scoreToGrade(80)).toBe('A');
    expect(scoreToGrade(70)).toBe('B');
    expect(scoreToGrade(50)).toBe('D');
  });
});

describe('tiers', () => {
  it('assigns tiers at the band boundaries', () => {
    expect(getTier(84.4).key).toBe('elite');
    expect(getTier(78).key).toBe('elite');     // min inclusive
    expect(getTier(77.9).key).toBe('great');
    expect(getTier(73.3).key).toBe('solid');   // Friends
    expect(getTier(70.4).key).toBe('solid');   // Freaks and Geeks
    expect(getTier(66).key).toBe('mixed');
    expect(getTier(64).key).toBe('weak');
  });
  it('treats null/NaN as the weakest tier (never throws)', () => {
    expect(getTier(null).key).toBe('weak');
    expect(getTier(undefined).key).toBe('weak');
    expect(getTier(NaN).key).toBe('weak');
  });
  it('sameTier compares band membership', () => {
    expect(sameTier(84.4, 82)).toBe(true);    // both elite
    expect(sameTier(78, 77.9)).toBe(false);   // elite vs great
  });
  it('tierIsUncertain flags CIs that cross a boundary', () => {
    expect(tierIsUncertain(78, 76, 80)).toBe(true);   // 76=great, 80=elite
    expect(tierIsUncertain(82, 80, 84)).toBe(false);  // both elite
    expect(tierIsUncertain(80)).toBe(false);          // no CI
  });
});

describe('comedy archetypes', () => {
  it('round-trips every archetype slug', () => {
    for (const a of ARCHES) {
      expect(archetypeBySlug(a.slug)?.key).toBe(a.key);
    }
  });
  it('returns undefined for an unknown slug', () => {
    expect(archetypeBySlug('not-a-real-archetype')).toBeUndefined();
  });
  it('tileText picks readable contrast', () => {
    expect(tileText('#000000')).toBe('#ffffff'); // white text on black
    expect(tileText('#ffffff')).toBe('#16130f'); // dark text on white
  });
});

describe('url helpers', () => {
  it('canonical adds a trailing slash and the www origin', () => {
    expect(canon('/shows/the-office')).toBe('https://www.thehumorindex.com/shows/the-office/');
    expect(canon('/shows/the-office/')).toBe('https://www.thehumorindex.com/shows/the-office/');
  });
  it('seo re-exports the same canonical helper', () => {
    expect(canonical('/faq')).toBe('https://www.thehumorindex.com/faq/');
  });
});
