import { Badge, Box, Button, Card, CardActionArea, CardContent, CardHeader, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, List, ListItem, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router';
import io from "socket.io-client"
import { Collection } from '../interfaces/Collection';
import { Invite } from '../interfaces/Invite';

interface Props {

}

export const CollectionsPage: React.FC<Props> = () => {
  const navigate = useNavigate()

  const [collections, setCollections] = useState<Collection[]>([])

  const [invitations, setInvitations] = useState<Invite[]>([])

  const [invDialog, openInvDialog] = useState(false)

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

    axios.get("/api/invites").then((response) => {
      setInvitations(response.data)
    })

    return () => {
      socket.removeAllListeners()
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

  const cards = collections.map((collection) => {
    return (
      <Card key={collection.id} sx={{width: 300}}>
        <CardActionArea
          onClick={() => {
            navigate(`/collections/${collection.id}`)
          }}
        >
          <CardMedia
            component="img"
            height="300"
            width="300"
            image={`/api/static/${collection.pictureid}`}
          />
          
          <CardContent>
            <Typography variant='h6'>{collection.name}</Typography>
            <Typography>{collection.description}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
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
    
      <Box mt={2}>
        {cards}
      </Box>

      <Dialog open={invDialog}>
        <DialogTitle>Kutsut</DialogTitle>
        <DialogContent>
          {
            invitations.length > 0 ? (
              <List>
                {invitations.map((invite) => {
                  return (
                    <Box>
                      <Typography>{`${invite.from} kutsui sinut kokoelmaan ${invite.collectionName}`}</Typography>
                      <Button onClick={() => acceptInvite(invite.inviteId)} sx={{m: 1}} variant="contained" color="success">Hyväksy</Button>
                      <Button onClick={() => declineInvite(invite.inviteId)} sx={{m: 1}} variant="contained" color="error">Hylkää</Button>
                    </Box>
                  )
                })}
              </List>
            )
            :
            (
              <Typography>No invitations received</Typography>
            )
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Sulje</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}