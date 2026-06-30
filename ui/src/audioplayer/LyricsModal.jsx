import React from 'react'
import ReactDOM from 'react-dom'
import { Dialog, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useTranslate } from 'react-admin'
import { DialogTitle } from '../dialogs/DialogTitle'
import { DialogContent } from '../dialogs/DialogContent'
import { parseLyrics } from './lyrics'

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

export const LyricsModal = ({ open, onClose, song }) => {
  const translate = useTranslate()
  const classes = useStyles()
  const blocks = parseLyrics(song?.lyrics)
  const title = [song?.title, song?.artist].filter(Boolean).join(' — ')

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
        {blocks.length === 0 ? (
          <Typography>{translate('player.emptyLyricText')}</Typography>
        ) : (
          blocks.map((block, index) => (
            <div key={index}>
              {blocks.length > 1 && block.lang && (
                <Typography variant="overline" className={classes.lang}>
                  {block.lang}
                </Typography>
              )}
              <Typography className={classes.text}>{block.text}</Typography>
            </div>
          ))
        )}
      </DialogContent>
    </Dialog>,
    document.body,
  )
}

export default LyricsModal
