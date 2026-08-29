// Converts a Google Drive share link (or bare file ID) into a direct-viewable image URL.
// Supports formats like:
//   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
//   https://drive.google.com/open?id=FILE_ID
//   https://drive.google.com/uc?id=FILE_ID
//   a bare FILE_ID
export function driveLinkToImageUrl(input) {
  if (!input) return null;
  const trimmed = input.trim();

  let id = null;

  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) id = fileMatch[1];

  if (!id) {
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch) id = idParamMatch[1];
  }

  // Bare ID (no slashes, no dots, reasonably long)
  if (!id && /^[a-zA-Z0-9_-]{15,}$/.test(trimmed)) {
    id = trimmed;
  }

  if (!id) return null;

  return `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
}
