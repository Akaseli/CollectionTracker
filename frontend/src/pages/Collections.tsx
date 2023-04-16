import { Badge, Box, Button, Grid, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import io from "socket.io-client"
import { RootState } from '../app/store';
import { CollectionCard } from '../components/CollectionCard';
import { InvitesDialog } from '../components/Dialogs/InvitesDialog';
import { Collection } from '../interfaces/Collection';
import { Invite } from '../interfaces/Invite';

interface Props {

}

export const CollectionsPage: React.FC<Props> = () => {
  const navigate = useNavigate()

  const [collections, setCollections] = useState<Collection[]>([])

  const [invitations, setInvitations] = useState<Invite[]>([])

  const [invDialog, openInvDialog] = useState(false)

  const user = useSelector((state: RootState) => state.user)

  const handleClose = () => {
    openInvDialog(false)
  }

  const handleOpen = () => {
    openInvDialog(true)
  }

  const socket = io("ws://localhost:3000", {
    reconnectionDelayMax: 10000,
    withCredentials: true
  })

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected")
    })

    socket.on("disconnect", () => {
      console.log("Disconnected")
    })

    socket.on("invite", (data) => {
      setInvitations((oldInvitations) => [...oldInvitations, JSON.parse(data)])
    })

    axios.get("/api/collections").then((response) => {
      setCollections(response.data)
    })
    .catch((error) => {
      if(error.response.status === 401){
        //Wait for app to redirect
      }
      else{
        return Promise.reject(error)
      }
    })

    axios.get("/api/invites").then((response) => {
      setInvitations(response.data)
    })
    .catch((error) => {
      if(error.response.status === 401){
        //Wait for app to redirect
      }
      else{
        return Promise.reject(error)
      }
    })

    return () => {
      socket.removeAllListeners()
      console.log("Socket closed")
    }
  }, [])

  const declineInvite = (id: number) => {
    axios.post(`/api/invite/decline/${id}`).then((response) => {
      if(response.status == 200){
        setInvitations(invitations.filter(invite => invite.inviteId !== id))
      }
    })
  }

  const acceptInvite = (id: number) => {
    axios.post(`/api/invite/accept/${id}`).then((response) => {
      if(response.status == 200){
        setInvitations(invitations.filter(invite => invite.inviteId !== id))
      }
    })
  }

  const collectionCards = collections.map((collection) => {
    return (
      <CollectionCard 
        collection={collection}
      />
    );
  })

  return(
    <Box m={2}>
      <Typography variant="h4">Kokoelmat</Typography>
      <Grid container mt={2} gap={2}>
        <Button variant="contained" onClick={() => {navigate("/collections/create")}}>Luo kokoelma</Button>
        <Badge badgeContent={invitations.length} color="secondary">
          <Button variant="contained" onClick={handleOpen}>Näytä kutsut</Button>
        </Badge>
      </Grid>
    
      <Grid container sx={{mt: 2}} spacing={2}>
        {collectionCards}
      </Grid>

      <InvitesDialog
        invitations={invitations}
        onDialogClose={handleClose}
        open={invDialog}
        onInviteAccept={acceptInvite}
        onInviteDecline={declineInvite}
      />
    </Box>
  );
}