import { Box, Button, IconButton, MenuItem, Select, SelectChangeEvent, Step, StepLabel, Stepper,TextField,Typography } from '@mui/material';
import React, { useState } from 'react'
import { Field, InputFormat } from '../interfaces/Field';

import DeleteIcon from '@mui/icons-material/Delete'
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'

interface Props {

}

const steps = ["Perustiedot", "Kokoelman kentät"]

export const CreateCollectionPage: React.FC<Props> = () => {
  const [activeStep, setActiveStep] = useState(0)

  const next = () => {
    setActiveStep((prevStep) => prevStep + 1)
  }

  const prev = () => {
    setActiveStep((prevStep) => prevStep + -1)
  }

  //Basic values
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const [image, setImage] = useState()
  const [crop, setCrop] = useState<Crop>()
  const [imageUrl, setUrl] = useState("")

  //Form values
  const [fields, setFields] = useState<Field[]>([])

  const handleImage = (e:any) => {
    setUrl(URL.createObjectURL(e.target.files[0]))
    setImage(e.target.files[0])
  }

  const addField = () => {
    let field:Field = {name: "", type: InputFormat.STRING}
    setFields([...fields, field])
  }

  const changeType = (e:SelectChangeEvent<InputFormat>, index: number) => {
    let newFields = [...fields]

    newFields[index].type = e.target.value as InputFormat

    setFields(newFields)
  }

  const changeName = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    let newFields = [...fields]

    newFields[index].name = e.target.value

    setFields(newFields)
  }

  const deleteField = (id:number) => {
    let newFields = [...fields]

    newFields.splice(id, 1)

    setFields(newFields)
  }

  const pages = [
    <Box mt={2}>
      <Typography variant='h5'>Perustiedot</Typography>
      <Typography>Nimi</Typography>
      <TextField defaultValue={name} onChange={(e) => {setName(e.target.value)}}></TextField>

      <Typography>Kuvaus</Typography>
      <TextField defaultValue={description} onChange={(e) => {setDescription(e.target.value)}}></TextField>

      <br/>
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
      <ReactCrop crop={crop} onChange={c => setCrop(c)}>
        <img src={imageUrl}/>
      </ReactCrop>
    </Box>,



    <Box mt={2}>
      <Typography variant='h5'>Kentät</Typography>
      <Button variant='contained' onClick={addField}>Lisää</Button>
      <Box sx={{mt: 2, display: "flex", flexDirection: "column", gap: 1.5}}>
        {fields.map((field, id) => {
          return (
            <Box 
              sx={{display: "flex", flexDirection: "row", alignItems: "center", gap: 2}}
              key={id}
            >
              <Typography>{id + 1}</Typography>
              <TextField defaultValue={field.name} onChange={(e) => {changeName(e, id)}}></TextField>

              <Typography>Kentän tyyppi</Typography>
              <Select
                value={field.type}
                onChange={(e) => changeType(e, id)}
              >
                <MenuItem value={InputFormat.STRING}>Teksti</MenuItem>
                <MenuItem value={InputFormat.NUMBER}>Numero</MenuItem>
                <MenuItem value={InputFormat.DATE}>Päivämäärä</MenuItem>
              </Select>

              <IconButton onClick={() => {deleteField(id)}}>
                <DeleteIcon />
              </IconButton>
            </Box>
          );
        })}
      </Box>
    </Box>
  ]

  return(
    <Box>
      <Typography variant='h4'>Luo kokoelma</Typography>
      <Box mt={2}>
        <Stepper activeStep={activeStep}>
          {
            steps.map((step, index) => {
              return (
                <Step key={step}>
                  <StepLabel>{step}</StepLabel>
                </Step>
              );
            })
          }
        </Stepper>
        {
          //Ohjaus
          activeStep === steps.length ? (
            <Box mt={2}>
              <Typography>Valmista</Typography>
            </Box>
          ) : (
            <Box>
              {pages[activeStep]}
              <Box sx={{display: "flex", flexDirection: "row", pt: 2}}>
                <Button 
                  disabled={activeStep === 0}
                  onClick={prev}  
                >Edellinen</Button>
                <Box sx={{flex: '1 1 auto'}}/>
                <Button
                  onClick={next}
                >{activeStep === steps.length - 1 ? "Luo" : "Seuraava"}</Button>
              </Box>
            </Box>
          )
        
        }
      </Box>
    </Box>
  );
}