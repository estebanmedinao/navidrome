// Turns the raw `lyrics` field of a song (a JSON string in Navidrome's
// LyricList format) into an array of displayable text blocks, one per language.
//
// Each block is `{ lang, text }`, where `text` is every line joined by
// newlines. Synced timestamps are ignored on purpose: this viewer shows the
// full lyrics at once, regardless of whether the song is synchronized.
//
// Returns an empty array when there are no lyrics or the data can't be parsed,
// so callers can safely treat "no lyrics" and "broken lyrics" the same way.
export const parseLyrics = (lyrics) => {
  if (!lyrics) {
    return []
  }

  let parsed
  try {
    parsed = JSON.parse(lyrics)
  } catch {
    return []
  }

  if (!Array.isArray(parsed)) {
    return []
  }

  return parsed
    .map((entry) => ({
      lang: entry.lang,
      text: (entry.line || [])
        .map((line) => line.value)
        .join('\n')
        .trim(),
    }))
    .filter((entry) => entry.text !== '')
}
