import { Box, Button, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, Input, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import ReactCrop, { Crop } from 'react-image-crop';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootState } from '../app/store';
import { CollectibleCard } from '../components/CollectibleCard';
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
  const [addName, setAddName] = useState("")
  const [addDescription, setAddDescription] = useState("")
  const [addCustom, setCustom] = useState({})

  const user = useSelector((state: RootState) => state.user)


  //PIcture stuff
  const [image, setImage] = useState()

  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })
  const [imageUrl, setUrl] = useState("")

  const [scaleX, setXScale] = useState(0)
  const [scaleY, setYScale] = useState(0)

  const previewImage = useRef<HTMLImageElement>(null)

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

  useEffect(() => {
    if(previewImage.current){
      setXScale(previewImage.current.naturalWidth/previewImage.current.width)
      setYScale(previewImage.current.naturalHeight/previewImage.current.height)
    }
  })

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

  const handleAddClose = () => {
    openAddDialog(false)
  }

  const handleAdd = () => {
    if(!image) return
    
    axios.post(
      `/api/collections/${id}/create`,
      {
        name: addName,
        description: addDescription,
        image: image,
        crop: JSON.stringify(crop),
        values: JSON.stringify(addCustom),
        scaleX: scaleX,
        scaleY: scaleY
      },
      {
        headers: {
          "content-type": "multipart/form-data"
        }
      }
    ).then(() => {
      setAddName("")
      setAddDescription("")
      setCustom({})
      openAddDialog(false)
    })
  }

  const handleImage = (e:any) => {
    setUrl(URL.createObjectURL(e.target.files[0]))
    setImage(e.target.files[0])
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
      return filter.toLowerCase() === ""
      ? collectible
      : collectible[filteredField].toLowerCase().includes(filter.toLowerCase())
    }
    else{
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



      <Dialog open={addDialog} onClose={handleAddClose}>
        <DialogTitle>Uusi keräiltävä</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Täytä perustiedot.
          </DialogContentText>
          <TextField
            autoFocus
            margin='dense'
            fullWidth
            label="Nimi"
            defaultValue={addName}
            onChange={(e) => {
              setAddName(e.target.value)
            }}
          />
          <TextField
            margin='dense'
            fullWidth
            label="Kuvaus"
            defaultValue={addDescription}
            onChange={(e) => {
              setAddDescription(e.target.value)
            }}
          />

          <DialogContentText>
            Kuva
          </DialogContentText>
          <Button sx={{mt: 2}}
            variant="contained"
            component="label"
          >
            Upload Image
            <input
              onChange={handleImage}
              accept="image/*"
              type="file"
              hidden
            />
          </Button>
          <br/>
          <Box
            sx={{
              mt: 2,
              maxWidth: "500px"
            }}
          >
            <ReactCrop aspect={1} crop={crop} onChange={c => setCrop(c)}>
              <img ref={previewImage} src={imageUrl}/>
            </ReactCrop>
          </Box>

          <DialogContentText>
            Käyttäjän itse määrittelemät kentät
          </DialogContentText>
          
          {
            fields
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose}>Peruuta</Button>
          <Button onClick={handleAdd}>Lisää</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}