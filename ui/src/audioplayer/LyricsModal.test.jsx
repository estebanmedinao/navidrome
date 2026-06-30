import * as React from 'react'
import { TestContext } from 'ra-test'
import { cleanup, render, screen } from '@testing-library/react'
import { describe, afterEach, it, expect } from 'vitest'
import { LyricsModal } from './LyricsModal'

const songWithLyrics = {
  id: 'song-1',
  title: 'Test Song',
  artist: 'Test Artist',
  lyrics: JSON.stringify([
    {
      lang: 'xxx',
      synced: false,
      line: [{ value: 'First line' }, { value: 'Second line' }],
    },
  ]),
}

const renderModal = (props) =>
  render(
    <TestContext>
      <LyricsModal open onClose={() => {}} song={songWithLyrics} {...props} />
    </TestContext>,
  )

describe('LyricsModal', () => {
  afterEach(cleanup)

  it('shows the full lyrics text when open', () => {
    renderModal()
    expect(screen.getByText(/First line/)).toBeInTheDocument()
    expect(screen.getByText(/Second line/)).toBeInTheDocument()
  })

  it('shows the song title and artist', () => {
    renderModal()
    expect(screen.getByText(/Test Song/)).toBeInTheDocument()
    expect(screen.getByText(/Test Artist/)).toBeInTheDocument()
  })

  it('shows an empty message when there are no lyrics', () => {
    renderModal({ song: { ...songWithLyrics, lyrics: '' } })
    expect(screen.getByText('player.emptyLyricText')).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    renderModal({ open: false })
    expect(screen.queryByText(/First line/)).not.toBeInTheDocument()
  })
})
