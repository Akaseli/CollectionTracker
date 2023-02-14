import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { Collection } from '../interfaces/Collection';

interface Props {

}

export const CollectionPage: React.FC<Props> = () => {
  const id = useParams()["id"]

  const [collection, setCollection] = useState<Collection>()

  const [dialog, openDialog] = useState(false)
  const [dialogInput, changeInput] = useState("")

  useEffect(() => {
    axios.get(`/api/collections/${id}`).then((response) => {
      setCollection(response.data[0])
    })
  }, [])

  if(!collection){
    return (
      <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh"}}>
        <CircularProgress />
      </Box>
    );
  }

  const handleClose = () => {
    openDialog(false)
    changeInput("")
  }

  const handleOpen = () => {
    openDialog(true)
  }

  const handleInvite = () => {
    openDialog(false)
    
    axios.post(
      "/api/invite", 
      {
        user: dialogInput,
        collection: id
      }
    )
    //TODO possible snackbar to confirm invite
    changeInput("")
  }

  return(
    <Box m={2}>
      <Typography variant="h4">{collection.name}</Typography>
      <Typography>{collection.description}</Typography>
      <Button sx={{mt: 2}} variant='contained' onClick={handleOpen}>Share</Button>

      <Dialog open={dialog} onClose={handleClose}>
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
            defaultValue={dialogInput}
            onChange={(e) => {
              changeInput(e.target.value)
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Peru</Button>
          <Button onClick={handleInvite}>Kutsu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}