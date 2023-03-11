import { Box, Button, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, Input, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import ReactCrop, { Crop } from 'react-image-crop';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootState } from '../app/store';
import { CollectibleCard } from '../components/CollectibleCard';
import { CreateCollectibleDialog } from '../components/Dialogs/CreateCollectibleDialog';
import { InviteDialog } from '../components/Dialogs/InviteDialog';
import { Collection } from '../interfaces/Collection';

interface Props {

}

export const CollectionPage: React.FC<Props> = () => {
  const id = useParams()["id"]

  const [collection, setCollection] = useState<Collection>()

  const [dialog, openDialog] = useState(false)
  const [dialogInput, changeInput] = useState("")

  const [addDialog, openAddDialog] = useState(false)
  const [addCustom, setCustom] = useState({})

  const user = useSelector((state: RootState) => state.user)

  const [filter, setFilter] = useState('')
  const [filterFields, setFields] = useState(["name", "description"])
  const [filteredField, setFiltered] = useState("name")

  useEffect(() => {
    axios.get(`/api/collections/${id}`).then((response) => {
      setCollection(response.data)

      //TODO proper types
      let customFields:string[] = ["name", "description"]

      response.data["template"].forEach((field:any) => {
        customFields.push(field["name"])
      });
    
      setFields([...customFields])
    })
    .catch((error) => {
      if(error.response.status === 401){
        //Wait for app to redirect
      }
      else{
        return Promise.reject(error)
      }
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

  const handleAddOpen = () => {
    openAddDialog(true)
  }

  const handleAddCollectibleClose = () => {
    openAddDialog(false)
  }

  const fields = collection.template.sort((a, b) => {
    const sortA = a.sort
    const sortB = b.sort

    if(sortA < b.sort){
      return -1
    }
    if(sortA > sortB){
      return 1
    }
    return 0
  }).map((field) => {
    return (
      <Box key={field.name}>
        <InputLabel>
          {field.name}
        </InputLabel>
        <TextField 
          type={field.type}
          margin='dense'
          fullWidth
          onChange={(e) => {
            setCustom({
              ...addCustom,
              [field.id]: e.target.value
            })
          }}
        />
      </Box>
    );
  }) 

  const selectOptions = filterFields.map((fieldName) => {
    switch(fieldName){
      case "name":
        return <MenuItem value={fieldName}>Nimi</MenuItem>
      case "description":
        return <MenuItem value={fieldName}>Kuvaus</MenuItem>
      default:
        return <MenuItem value={fieldName}>{fieldName}</MenuItem>
    }
  })

  //Filtering and them card
  const collectibles = collection.collectibles?.filter((collectible) => {
    if(filteredField === "name" || filteredField === "description"){
      //Fields that every collectible have
      return filter.toLowerCase() === ""
      ? collectible
      : collectible[filteredField].toLowerCase().includes(filter.toLowerCase())
    }
    else{
      //Custom user field
      let fieldIndex = collection.template.find((item) => item.name === filteredField)
      if(!fieldIndex){
        return collectible
      }

      return filter.toLowerCase() === ""
      ? collectible
      : collectible.data[fieldIndex.id].toString().toLowerCase().includes(filter.toLowerCase())
    }
  }).map((collectible) => {
    return (
      <CollectibleCard collectible={collectible} template={collection.template}/>
    );
  })

  return(
    <Box m={2}>
      <Typography variant="h4">{collection.name}</Typography>
      <Typography>{collection.description}</Typography>
      <Box>
        <Button sx={{m: 1}} variant='contained' onClick={handleAddOpen}>Lisää</Button>
        {
          user.id === collection.owner && (
            <Button sx={{m: 1}} variant='contained' onClick={handleOpen}>Share</Button>
          )   
        }
      </Box>

      {
        user.id === collection.owner && (
          <InviteDialog
            open={dialog}
            onClose={handleClose}
            username={dialogInput}
            onUsernameChange={(e) => {changeInput(e.target.value)}}
            onSubmit={handleInvite}
          />
        )
      }

      <Box sx={{display: "flex", gap: 2, mt: 2}}>
        <Select
          defaultValue={"name"}
          onChange={(e) => {
            setFiltered(e.target.value)
          }}
        >
          {selectOptions}
        </Select>

        <TextField
          fullWidth
          label="Hae keräiltävää"
          onChange={(e) => {
            setFilter(e.target.value)
          }}
      />
      </Box>
      
      <Grid container sx={{mt: 2}} spacing={2}>
        {collectibles}
      </Grid>

      
      <CreateCollectibleDialog 
        fields={fields}
        onClose={handleAddCollectibleClose}
        uploadUrl={`/api/collections/${id}/create`}
        open={addDialog}
      />

    </Box>
  );
}