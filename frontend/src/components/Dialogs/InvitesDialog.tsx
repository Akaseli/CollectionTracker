import { Button, Dialog, DialogActions, DialogContent, DialogTitle, List, Typography } from '@mui/material';
import axios from 'axios';
import React from 'react'
import { Invite } from '../../interfaces/Invite';
import { InviteComponent } from '../Invite';

interface Props {
  open: boolean
  invitations: Invite[]
  onInviteAccept: (arg0: number) => void,
  onInviteDecline: (arg0: number) => void
  onDialogClose: () => void
}

export const InvitesDialog: React.FC<Props> = ({open, invitations, onInviteAccept, onInviteDecline, onDialogClose}) => {
  const invites = invitations.map((invite) => {
    return (
      <InviteComponent
        invite={invite}
        onAccept={onInviteAccept}
        onDecline={onInviteDecline}
      />
    );
  })

  return(
    <Dialog open={open}>
        <DialogTitle>Kutsut</DialogTitle>
        <DialogContent>
          {
            invitations.length > 0 
            ? ( <List> {invites} </List> )
            : ( <Typography>No invitations received</Typography> )
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={onDialogClose}>Sulje</Button>
        </DialogActions>
    </Dialog>
  );
}