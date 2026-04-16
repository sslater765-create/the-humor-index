'use client';

const TOP_EPISODES = [
  '/shows/the-office/4/13',  // Dinner Party
  '/shows/the-office/3/19',  // Safety Training
  '/shows/seinfeld/5/13',    // The Dinner Party
  '/shows/the-office/9/17',  // The Farm
  '/shows/seinfeld/1/4',     // Male Unbonding
  '/shows/the-office/3/4',   // Grief Counseling
  '/shows/seinfeld/7/11',    // The Rye
  '/shows/the-office/5/14',  // Stress Relief
  '/shows/seinfeld/3/17',    // The Boyfriend
  '/shows/the-office/2/1',   // The Dundies
  '/shows/friends/8/9',      // The One With The Rumor
  '/shows/friends/10/18',    // The Last One, Part 2
  '/shows/friends/10/6',     // The One With Ross's Grant
  '/shows/friends/7/6',      // The One With The Nap Partners
  '/shows/friends/9/15',     // The One With The Mugging
];

export default function SurpriseButton() {
  const handleClick = () => {
    const pick = TOP_EPISODES[Math.floor(Math.random() * TOP_EPISODES.length)];
    window.location.href = pick;
  };

  return (
    <button
      onClick={handleClick}
      className="text-sm text-brand-text-muted hover:text-brand-gold border border-brand-border hover:border-brand-gold/40 rounded-lg px-4 py-2 transition-colors"
    >
      Surprise me with a great episode
    </button>
  );
}
