import { describe, it, expect } from 'vitest'
import { parseStructuredLyrics, splitBold } from './lyrics'

describe('parseStructuredLyrics', () => {
  it('returns an empty array when the input is missing', () => {
    expect(parseStructuredLyrics(null)).toEqual([])
    expect(parseStructuredLyrics(undefined)).toEqual([])
  })

  it('returns an empty array when the input is not a list', () => {
    expect(parseStructuredLyrics('nope')).toEqual([])
  })

  it('returns an empty array for an empty list', () => {
    expect(parseStructuredLyrics([])).toEqual([])
  })

  it('joins the lines of an unsynced lyric into a single text block', () => {
    expect(
      parseStructuredLyrics([
        {
          lang: 'xxx',
          synced: false,
          line: [{ value: 'First line' }, { value: 'Second line' }],
        },
      ]),
    ).toEqual([{ lang: 'xxx', text: 'First line\nSecond line' }])
  })

  it('ignores timestamps and keeps the text for synced lyrics', () => {
    expect(
      parseStructuredLyrics([
        {
          lang: 'eng',
          synced: true,
          line: [
            { start: 1000, value: 'Hello' },
            { start: 2000, value: 'World' },
          ],
        },
      ]),
    ).toEqual([{ lang: 'eng', text: 'Hello\nWorld' }])
  })

  it('returns one block per language', () => {
    expect(
      parseStructuredLyrics([
        { lang: 'eng', synced: false, line: [{ value: 'Hello' }] },
        { lang: 'spa', synced: false, line: [{ value: 'Hola' }] },
      ]),
    ).toEqual([
      { lang: 'eng', text: 'Hello' },
      { lang: 'spa', text: 'Hola' },
    ])
  })

  it('skips entries that have no usable text', () => {
    expect(
      parseStructuredLyrics([
        { lang: 'eng', synced: false, line: [] },
        { lang: 'spa', synced: false, line: [{ value: '   ' }] },
        { lang: 'fra', synced: false, line: [{ value: 'Bonjour' }] },
      ]),
    ).toEqual([{ lang: 'fra', text: 'Bonjour' }])
  })
})

describe('splitBold', () => {
  it('returns a single plain segment when there is no markup', () => {
    expect(splitBold('hello world')).toEqual([
      { text: 'hello world', bold: false },
    ])
  })

  it('marks **text** as bold', () => {
    expect(splitBold('a **b** c')).toEqual([
      { text: 'a ', bold: false },
      { text: 'b', bold: true },
      { text: ' c', bold: false },
    ])
  })

  it('handles bold at the start and multiple markers', () => {
    expect(splitBold('**x** y **z**')).toEqual([
      { text: 'x', bold: true },
      { text: ' y ', bold: false },
      { text: 'z', bold: true },
    ])
  })

  it('keeps unmatched asterisks literal', () => {
    expect(splitBold('a **b')).toEqual([{ text: 'a **b', bold: false }])
  })

  it('returns an empty array for an empty string', () => {
    expect(splitBold('')).toEqual([])
  })
})
