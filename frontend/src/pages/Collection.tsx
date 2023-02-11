import { Box, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { Collection } from '../interfaces/Collection';

interface Props {

}

export const CollectionPage: React.FC<Props> = () => {
  const id = useParams()["id"]

  const [collection, setCollection] = useState<Collection>()

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

  return(
    <Box m={2}>
      <Typography variant="h4">{collection.name}</Typography>
      <Typography>{collection.description}</Typography>
    </Box>
  );
}