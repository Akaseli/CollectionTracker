import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import React from 'react'

interface Props {
  open: boolean,
  onClose: () => void,

  username: string,
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void

  onSubmit: () => void
}

export const InviteDialog: React.FC<Props> = ({open, onClose, username, onUsernameChange, onSubmit}) => {
  return(
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Kutsu joku tähän kokoelmaan!</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Syötä kutsuttavan henkilön käyttäjätunnus alle.
        </DialogContentText>
        <TextField
          autoFocus
          margin='dense'
          fullWidth
          variant='standard'
          label="Käyttäjätunnus"
          defaultValue={username}
          onChange={onUsernameChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Peru</Button>
        <Button onClick={onSubmit}>Kutsu</Button>
      </DialogActions>
    </Dialog>
  );
}