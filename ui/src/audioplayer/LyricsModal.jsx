import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { Dialog, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useTranslate } from 'react-admin'
import { DialogTitle } from '../dialogs/DialogTitle'
import { DialogContent } from '../dialogs/DialogContent'
import subsonic from '../subsonic'
import { parseStructuredLyrics, splitBold } from './lyrics'

const useStyles = makeStyles((theme) => ({
  text: {
    whiteSpace: 'pre-wrap',
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  lang: {
    display: 'block',
    marginTop: theme.spacing(2),
    opacity: 0.6,
  },
}))

// Renders a block's text, turning the `**bold**` convention into <strong>.
// Newlines are preserved by the `pre-wrap` style on the container.
const renderText = (text) =>
  splitBold(text).map((segment, index) =>
    segment.bold ? (
      <strong key={index}>{segment.text}</strong>
    ) : (
      <React.Fragment key={index}>{segment.text}</React.Fragment>
    ),
  )

export const LyricsModal = ({ open, onClose, song }) => {
  const translate = useTranslate()
  const classes = useStyles()
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(false)
  const title = [song?.title, song?.artist].filter(Boolean).join(' — ')

  // Lyrics are fetched lazily when the modal opens, from the endpoint that
  // resolves embedded + external (.lrc/.txt) + plugin lyrics.
  useEffect(() => {
    if (!open || !song?.id) {
      setBlocks([])
      return
    }

    let cancelled = false
    setLoading(true)
    subsonic
      .getLyrics(song.id)
      .then((resp) => {
        if (cancelled) return
        const structured =
          resp?.json?.['subsonic-response']?.lyricsList?.structuredLyrics
        setBlocks(parseStructuredLyrics(structured))
      })
      .catch(() => {
        if (!cancelled) setBlocks([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, song?.id])

  return ReactDOM.createPortal(
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
    >
      <DialogTitle onClose={onClose}>{title}</DialogTitle>
      <DialogContent dividers>
        {loading ? null : blocks.length === 0 ? (
          <Typography>{translate('player.emptyLyricText')}</Typography>
        ) : (
          blocks.map((block, index) => (
            <div key={index}>
              {blocks.length > 1 && block.lang && (
                <Typography variant="overline" className={classes.lang}>
                  {block.lang}
                </Typography>
              )}
              <Typography className={classes.text}>
                {renderText(block.text)}
              </Typography>
            </div>
          ))
        )}
      </DialogContent>
    </Dialog>,
    document.body,
  )
}

export default LyricsModal
