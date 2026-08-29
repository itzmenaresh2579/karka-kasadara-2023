export function IconPlay({ color = "#F5A623" }) {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="14" fill={color} opacity="0.16" />
      <path d="M11 9l10 6-10 6V9z" fill={color} />
    </svg>
  );
}

export function IconBook({ color = "#E8604C" }) {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="14" fill={color} opacity="0.16" />
      <path d="M15 9c-2-1.5-5-1.5-7-1v13c2-0.5 5-0.5 7 1 2-1.5 5-1.5 7-1V8c-2-0.5-5-0.5-7 1z" fill={color} />
    </svg>
  );
}

export function IconPalette({ color = "#4C9A6E" }) {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="14" fill={color} opacity="0.16" />
      <path d="M15 6a9 9 0 100 18c1.4 0 2-1 2-2s-.6-1.5-1-2 .2-2 1.5-2H19a5 5 0 005-5c0-4-4-7-9-7z" fill={color} />
      <circle cx="10.5" cy="13" r="1.6" fill="#FFF8EC" />
      <circle cx="14" cy="9.5" r="1.6" fill="#FFF8EC" />
      <circle cx="19" cy="11" r="1.6" fill="#FFF8EC" />
    </svg>
  );
}

export function IconShield({ color = "#6FB7DE" }) {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="14" fill={color} opacity="0.16" />
      <path d="M15 6l7 3v6c0 5-3 8.5-7 9.5-4-1-7-4.5-7-9.5V9l7-3z" fill={color} />
      <path d="M11.5 15l2.3 2.3L18.5 13" stroke="#FFF8EC" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const PROGRAM_ICONS = {
  marigold: IconPlay,
  coral: IconBook,
  leaf: IconPalette,
  sky: IconShield,
};
