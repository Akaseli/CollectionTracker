import { Box, Button, CircularProgress, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../app/store';
import { CollectibleCard } from '../components/CollectibleCard';
import { CreateCollectibleDialog } from '../components/Dialogs/CreateCollectibleDialog';
import { DeleteCollectibleDialog } from '../components/Dialogs/DeleteCollectibleDialog';
import { InviteDialog } from '../components/Dialogs/InviteDialog';
import { Collectible, Collection } from '../interfaces/Collection';

import io from "socket.io-client"

interface Props {

}

export const CollectionPage: React.FC<Props> = () => {
  const navigate = useNavigate()

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

  const [deleteDialog, openDeleteDialog] = useState(false)
  const [activeCollectible, setActiveCollectible] = useState<Collectible|undefined>()

  const socket = io("ws://localhost:3000", {
    reconnectionDelayMax: 10000,
    withCredentials: true
  }) 

  const collectionRef = useRef(collection)

  useEffect(() => {
    collectionRef.current = collection
  })

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
      if(error.response.status === 403){
        navigate("/collections/")
      }
      else{
        return Promise.reject(error)
      }
    })
  }, [])

  useEffect(() => {
    socket.on("connect", () => {
      //Send join with current collection id
      socket.emit("join", id)
    })

    socket.on("disconnect", () => {
      console.log("Disconnected")
    })

    //Live item updates
    socket.on("delete", (id) => {
      if(!collectionRef.current) return

      let collectibleItems: Collectible[] = collectionRef.current.collectibles.filter((item) => item.id != id) ?? [];

      setCollection({...collectionRef.current, collectibles: collectibleItems})
    })

    socket.on("create", (item) => {
      if(!collectionRef.current) return

      let nCollectible: Collectible = item;

      console.log(nCollectible)

      let collectibleItems: Collectible[] = [...collectionRef.current.collectibles, nCollectible]

      setCollection({...collectionRef.current, collectibles: collectibleItems})
    })

    return () => {
      socket.removeAllListeners()
      console.log("Socket closed")
    }
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

  const handleDelete = (collectible: Collectible) => {
    setActiveCollectible(collectible)
    openDeleteDialog(true)
  }

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
      <CollectibleCard collectible={collectible} template={collection.template} onDelete={() => {handleDelete(collectible)}}/>
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
            <Button sx={{m: 1}} variant='contained' onClick={handleOpen}>Jaa</Button>
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

      {
        activeCollectible && (
          <DeleteCollectibleDialog 
            collectible={activeCollectible}
            onClose={() => {openDeleteDialog(false)}}
            open={deleteDialog}
            collectionId={id}
          />
        )
      }

      <CreateCollectibleDialog
        template={collection.template}
        onClose={handleAddCollectibleClose}
        uploadUrl={`/api/collections/${id}/create`}
        open={addDialog}
      />
    </Box>
  );
}