import { Box, Button, Typography } from '@mui/material';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router';
import io from "socket.io-client"


interface Props {

}

export const CollectionPage: React.FC<Props> = () => {
  const navigate = useNavigate()

  const socket = io("ws://localhost:3000", {
    reconnectionDelayMax: 10000,
    withCredentials: true
  })

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected")
    })

    return () => {

    }
  }, [])

  return(
    <Box>
      <Typography variant="h4">Kokoelmat</Typography>
      <Box mt={2}>
        <Button variant="contained" onClick={() => {navigate("/collections/create")}}>Luo kokoelma</Button>
      </Box>
    </Box>
  );
}