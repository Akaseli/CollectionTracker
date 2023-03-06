import { Card, CardActionArea, CardContent, CardMedia, Divider, Grid, Typography } from '@mui/material';
import React from 'react'
import { Collectible } from '../interfaces/Collection';
import { Field } from '../interfaces/Field';

interface Props {
  collectible: Collectible,
  template: Field[]
}

export const CollectibleCard: React.FC<Props> = ({collectible, template}) => {
  let custom = template.map((field, index) => {
    return (
      <Typography>{field.name + ": " + collectible.data[field.id]}</Typography>
    );
  })

  return (
    <Grid item key={collectible.id}>
      <Card sx={{width: 300}}>
        <CardActionArea
          onClick={() => {
            
          }}
        >
          <CardMedia
            component="img"
            height="300"
            width="300"
            image={`/api/static/${collectible.pictureid}`}
          />
          
          <CardContent>
            <Typography variant='h6'>{collectible.name}</Typography>
            <Typography>{collectible.description}</Typography>
            <Divider sx={{m: 1}}/>
            {custom}
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
}