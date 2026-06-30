import { parseLyrics } from './lyrics'

describe('parseLyrics', () => {
  it('returns an empty array when lyrics are missing', () => {
    expect(parseLyrics('')).toEqual([])
    expect(parseLyrics(null)).toEqual([])
    expect(parseLyrics(undefined)).toEqual([])
  })

  it('returns an empty array for invalid JSON', () => {
    expect(parseLyrics('not json')).toEqual([])
  })

  it('returns an empty array for an empty lyrics list', () => {
    expect(parseLyrics('[]')).toEqual([])
  })

  it('joins the lines of an unsynced lyric into a single text block', () => {
    const lyrics = JSON.stringify([
      {
        lang: 'xxx',
        synced: false,
        line: [{ value: 'First line' }, { value: 'Second line' }],
      },
    ])

    expect(parseLyrics(lyrics)).toEqual([
      { lang: 'xxx', text: 'First line\nSecond line' },
    ])
  })

  it('ignores timestamps and keeps the text for synced lyrics', () => {
    const lyrics = JSON.stringify([
      {
        lang: 'eng',
        synced: true,
        line: [
          { start: 1000, value: 'Hello' },
          { start: 2000, value: 'World' },
        ],
      },
    ])

    expect(parseLyrics(lyrics)).toEqual([{ lang: 'eng', text: 'Hello\nWorld' }])
  })

  it('returns one block per language', () => {
    const lyrics = JSON.stringify([
      { lang: 'eng', synced: false, line: [{ value: 'Hello' }] },
      { lang: 'spa', synced: false, line: [{ value: 'Hola' }] },
    ])

    expect(parseLyrics(lyrics)).toEqual([
      { lang: 'eng', text: 'Hello' },
      { lang: 'spa', text: 'Hola' },
    ])
  })

  it('skips entries that have no usable text', () => {
    const lyrics = JSON.stringify([
      { lang: 'eng', synced: false, line: [] },
      { lang: 'spa', synced: false, line: [{ value: '   ' }] },
      { lang: 'fra', synced: false, line: [{ value: 'Bonjour' }] },
    ])

    expect(parseLyrics(lyrics)).toEqual([{ lang: 'fra', text: 'Bonjour' }])
  })
})
