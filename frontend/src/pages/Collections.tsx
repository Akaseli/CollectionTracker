import { Box, Button, Typography } from '@mui/material';
import React from 'react'
import { useNavigate } from 'react-router';

interface Props {

}

export const CollectionPage: React.FC<Props> = () => {
  const navigate = useNavigate()

  return(
    <Box>
      <Typography variant="h4">Kokoelmat</Typography>
      <Box mt={2}>
        <Button variant="contained" onClick={() => {navigate("/collections/create")}}>Luo kokoelma</Button>
      </Box>
    </Box>
  );
}