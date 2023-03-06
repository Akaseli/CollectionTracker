import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import React from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../app/store';
import { Collection } from '../interfaces/Collection';

interface Props {
  collection: Collection
}

export const CollectionCard: React.FC<Props> = ({collection}) => {

  const user = useSelector((state: RootState) => state.user)
  const navigator = useNavigate()

  return(
    <Grid item key={collection.id}>
      <Card sx={{width: 300}}>
        <CardActionArea
          onClick={() => {
            navigator(`/collections/${collection.id}`)
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
            <Typography variant='subtitle2'>{collection.owner === user.id? "Omistettu" : "Jaettu sinulle"}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
}