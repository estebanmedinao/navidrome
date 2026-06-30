import * as React from 'react'
import { TestContext } from 'ra-test'
import { cleanup, render, screen } from '@testing-library/react'
import { describe, afterEach, it, expect, vi } from 'vitest'
import { LyricsModal } from './LyricsModal'
import subsonic from '../subsonic'

vi.mock('../subsonic', () => ({
  default: { getLyrics: vi.fn() },
}))

const lyricsResponse = (structuredLyrics) => ({
  json: {
    'subsonic-response': { status: 'ok', lyricsList: { structuredLyrics } },
  },
})

const song = { id: 'song-1', title: 'Test Song', artist: 'Test Artist' }

const renderModal = (props) =>
  render(
    <TestContext>
      <LyricsModal open onClose={() => {}} song={song} {...props} />
    </TestContext>,
  )

describe('LyricsModal', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('fetches and shows the full lyrics text when open', async () => {
    subsonic.getLyrics.mockResolvedValue(
      lyricsResponse([
        {
          lang: 'xxx',
          synced: false,
          line: [{ value: 'First line' }, { value: 'Second line' }],
        },
      ]),
    )

    renderModal()

    expect(await screen.findByText(/First line/)).toBeInTheDocument()
    expect(screen.getByText(/Second line/)).toBeInTheDocument()
    expect(subsonic.getLyrics).toHaveBeenCalledWith('song-1')
  })

  it('renders **bold** markers as bold text', async () => {
    subsonic.getLyrics.mockResolvedValue(
      lyricsResponse([
        {
          lang: 'xxx',
          synced: false,
          line: [{ value: 'plain **strong** end' }],
        },
      ]),
    )

    renderModal()

    const bold = await screen.findByText('strong')
    expect(bold.tagName).toBe('STRONG')
  })

  it('shows the song title and artist', async () => {
    subsonic.getLyrics.mockResolvedValue(
      lyricsResponse([{ lang: 'xxx', synced: false, line: [{ value: 'x' }] }]),
    )

    renderModal()

    expect(await screen.findByText(/Test Song/)).toBeInTheDocument()
    expect(screen.getByText(/Test Artist/)).toBeInTheDocument()
  })

  it('shows an empty message when there are no lyrics', async () => {
    subsonic.getLyrics.mockResolvedValue(lyricsResponse([]))

    renderModal()

    expect(await screen.findByText('player.emptyLyricText')).toBeInTheDocument()
  })

  it('does not fetch lyrics when closed', () => {
    subsonic.getLyrics.mockResolvedValue(lyricsResponse([]))

    renderModal({ open: false })

    expect(subsonic.getLyrics).not.toHaveBeenCalled()
  })
})
