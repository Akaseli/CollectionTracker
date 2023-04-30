import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';
import axios from 'axios';
import React from 'react'
import { Collectible } from '../../interfaces/Collection';


interface Props {
  collectible: Collectible,
  open: boolean,
  onClose: () => void,
  collectionId: string | undefined
}

export const DeleteCollectibleDialog: React.FC<Props> = ({open, collectible, onClose, collectionId}) => {
  const deleteCollectible = () => {
    if(!collectionId) return
    
    axios.delete(
      `/api/collections/${collectionId}/delete/${collectible.id}`
    )

    onClose()
  } 

  return(
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        {"Haluatko varmasti poistaa tavaran: " + collectible.name}
      </DialogTitle>
      <DialogActions>
        <Button onClick={onClose}>Peruuta</Button>
        <Button onClick={deleteCollectible} sx={{bgcolor: "red", color: "white"}}>Poista</Button>
      </DialogActions>
    </Dialog>
  );
}