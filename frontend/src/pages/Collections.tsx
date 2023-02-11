import { Box, Button, Card, CardActionArea, CardContent, CardHeader, CardMedia, IconButton, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router';
import io from "socket.io-client"
import { Collection } from '../interfaces/Collection';

interface Props {

}

export const CollectionsPage: React.FC<Props> = () => {
  const navigate = useNavigate()

  const [collections, setCollections] = useState<Collection[]>([])

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
    
    axios.get("/api/collections").then((response) => {
      setCollections(response.data)
    })

    return () => {

    }
  }, [])

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
      <Box mt={2}>
        <Button variant="contained" onClick={() => {navigate("/collections/create")}}>Luo kokoelma</Button>
      </Box>

      <Box mt={2}>
        {cards}
      </Box>
    </Box>
  );
}