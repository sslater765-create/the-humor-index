// The running-gag bracket, run as a weekly tournament. The field is picked by
// an editor (one gag per show, the one fans would name), seeded by LAR. Each
// round is open for one week; the crowd's vote decides who advances, with the
// higher seed winning a tie.

/** Show slug -> gag name, exactly as in running-gags.json. Order is irrelevant; seeds come from LAR. */
export const BRACKET_FIELD: Record<string, string> = {
  'the-office': "Dwight's beet farm",
  'the-simpsons': "Troy McClure's Introduction",
  'parks-and-recreation': 'Bert Macklin / Janet Snakehole',
  'arrested-development': '"I\'ve made a huge mistake"',
  seinfeld: 'McKigney the hand model cautionary tale',
  community: 'Jim Belushi as a Unit of Mediocrity',
  'the-larry-sanders-show': 'Hank\'s "Hey Now"',
  friends: 'Ugly Naked Guy',
  'its-always-sunny': 'Bird law',
  'schitts-creek': "Moira's Sunrise Bay past",
  veep: '"Are you fucking kidding me"',
  'broad-city': "Abbi's full name as battle cry",
  'the-fresh-prince-of-bel-air': 'Will is from Philly',
  '30-rock': 'The Rural Juror',
  futurama: 'Bite my shiny metal ass',
  'curb-your-enthusiasm': 'Pretty Pretty Pretty Good',
};

export const ROUND_NAMES = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Final'];

/**
 * Round r closes at ROUND_CLOSES[r]. Round 1 is open from launch; each later
 * round opens when the one before closes. Sunday 8 PM Eastern (01:00 UTC Monday).
 */
export const ROUND_CLOSES = [
  '2026-11-30T01:00:00Z',
  '2026-12-07T01:00:00Z',
  '2026-12-14T01:00:00Z',
  '2026-12-21T01:00:00Z',
];

/** The round open for voting at time t: 0..3, or 4 once the final has closed. */
export function openRound(t: number = Date.now()): number {
  const i = ROUND_CLOSES.findIndex((c) => t < Date.parse(c));
  return i === -1 ? 4 : i;
}

export const BRACKET_ID = /^[a-z0-9-]{2,60}:\d{1,3}$/;
