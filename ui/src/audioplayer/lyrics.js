// Turns the `structuredLyrics` array returned by the Subsonic
// `getLyricsBySongId` endpoint into displayable text blocks, one per language.
//
// Using that endpoint (instead of the embedded `lyrics` field of the song) is
// what lets this viewer show lyrics that live in external `.lrc`/`.txt`
// sidecar files, not just lyrics embedded in the audio tags.
//
// Each block is `{ lang, text }`, where `text` is every line joined by
// newlines. Synced timestamps are ignored on purpose: this viewer shows the
// full lyrics at once, regardless of whether the song is synchronized.
//
// Returns an empty array when the input is missing or not a list, so callers
// can treat "no lyrics" and "broken response" the same way.
export const parseStructuredLyrics = (structuredLyrics) => {
  if (!Array.isArray(structuredLyrics)) {
    return []
  }

  return structuredLyrics
    .map((entry) => ({
      lang: entry.lang,
      text: (entry.line || [])
        .map((line) => line.value)
        .join('\n')
        .trim(),
    }))
    .filter((entry) => entry.text !== '')
}

// Splits a line of lyrics into `{ text, bold }` segments based on a light
// Markdown-style `**bold**` convention, so the choir's adaptations can mark
// emphasis (e.g. the Spanish translation, or who sings a part) right in the
// `.lrc` file. Unmatched `**` are left literal. `.` does not match newlines,
// so emphasis never spans lines by accident.
export const splitBold = (text) => {
  const segments = []
  const re = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), bold: false })
    }
    segments.push({ text: match[1], bold: true })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: false })
  }

  return segments
}
