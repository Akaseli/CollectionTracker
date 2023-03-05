import React from 'react'
import { Button, Box, Typography } from '@mui/material';
import { Invite } from '../interfaces/Invite';

interface Props {
  invite: Invite,
  onAccept: (arg0: number) => void,
  onDecline: (arg0: number) => void,
}

export const InviteComponent: React.FC<Props> = ({invite, onAccept, onDecline}) => {
  return(
    <Box>
      <Typography>{`${invite.from} kutsui sinut kokoelmaan ${invite.collectionName}`}</Typography>
      <Button onClick={() => onAccept(invite.inviteId)} sx={{m: 1}} variant="contained" color="success">Hyväksy</Button>
      <Button onClick={() => onDecline(invite.inviteId)} sx={{m: 1}} variant="contained" color="error">Hylkää</Button>
    </Box>
  );
}