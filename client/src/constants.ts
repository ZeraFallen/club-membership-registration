// Keep these lists in sync with server/validate.js
export const CLUBS = [
  { name: 'Coding Club', color: '#2f5bea' },
  { name: 'Robotics Club', color: '#c2410c' },
  { name: 'Photography Club', color: '#0f766e' },
  { name: 'Music Society', color: '#7c3aed' },
  { name: 'Debate Society', color: '#a16207' },
  { name: 'Volunteer Corps', color: '#be123c' },
];

export const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const FALLBACK_COLOR = '#475569';

export function clubColor(clubName: string): string {
  return CLUBS.find((club) => club.name === clubName)?.color ?? FALLBACK_COLOR;
}
