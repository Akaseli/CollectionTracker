import { Card, CardActionArea, CardActions, CardContent, CardMedia, Divider, Grid, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import React from 'react'
import { Collectible } from '../interfaces/Collection';
import { Field, InputFormat } from '../interfaces/Field';
import Delete from '@mui/icons-material/Delete';

interface Props {
  collectible: Collectible,
  template: Field[]
  onDelete: () => void
}

export const CollectibleCard: React.FC<Props> = ({collectible, template, onDelete}) => {


  let custom = template.map((field, index) => {
    //Custom for dates
    if(template[index].type == InputFormat.DATE){
      return (
        <Typography>{field.name + ": " + new Date(collectible.data[field.id]).toLocaleDateString()}</Typography>
      );
    }
    else{
      return (
        <Typography>{field.name + ": " + collectible.data[field.id]}</Typography>
      );
    }
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
        <CardActions>
          <IconButton onClick={onDelete}>
            <Delete />
          </IconButton>
        </CardActions>
      </Card>
    </Grid>
  );
}