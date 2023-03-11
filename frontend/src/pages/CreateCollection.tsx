import { Box, Button, IconButton, MenuItem, Select, SelectChangeEvent, Step, StepLabel, Stepper,TextField,Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react'
import { Field, InputFormat } from '../interfaces/Field';

import DeleteIcon from '@mui/icons-material/Delete'
import ArrowUp from '@mui/icons-material/ArrowUpward'
import ArrowDown from '@mui/icons-material/ArrowDownward'


import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'
import axios from 'axios';
import { useNavigate } from 'react-router';

interface Props {

}

const steps = ["Perustiedot", "Kokoelman kentät"]

export const CreateCollectionPage: React.FC<Props> = () => {
  const navigate = useNavigate()

  const [activeStep, setActiveStep] = useState(0)

  const nextStep = () => {
    if(activeStep != steps.length -1){
      setActiveStep((prevStep) => prevStep + 1)
    }
    else{
      createCollection()
    }
  }

  const prevStep = () => {
    setActiveStep((prevStep) => prevStep + -1)
  }

  //Basic values
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

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

  //Form values
  const [fields, setFields] = useState<Field[]>([])

  const createCollection = () => {
    //Todo error
    if(!image) return
    
    axios.post(
      "/api/collection",
      {
        name: name,
        description: description,
        image: image,
        crop: JSON.stringify(crop),
        fields: JSON.stringify(fields),
        scaleX: scaleX,
        scaleY: scaleY
      },
      {
        headers: {
          "content-type": "multipart/form-data"
        }
      }
    ).then((response) => {
      if(response.status == 200){
        navigate("/collections/")
      }
    })
  }

  const handleImage = (e:any) => {
    setUrl(URL.createObjectURL(e.target.files[0]))
    setImage(e.target.files[0])
  }

  const addField = () => {
    let field:Field = {name: "", type: InputFormat.TEXT, sort: (fields.length == 0? 0 : fields[fields.length-1].id + 1), id: (fields.length == 0? 0 : fields[fields.length-1].id + 1)}
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

  const deleteField = (index:number) => {
    let newFields = [...fields]

    newFields.splice(index, 1)

    setFields(newFields)
  }

  useEffect(() => {
    if(previewImage.current){
      setXScale(previewImage.current.naturalWidth/previewImage.current.width)
      setYScale(previewImage.current.naturalHeight/previewImage.current.height)
    }
  })

  const changePriority = (index: number, amount: number) => {
    let newFields = [...fields]

    newFields[index].sort += amount

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
    </Box>,


    
    <Box mt={2}>
      <Typography variant='h5'>Kentät</Typography>
      <Button variant='contained' onClick={addField}>Lisää</Button>
      <Box sx={{mt: 2, display: "flex", flexDirection: "column", gap: 1.5}}>
        {
        fields.map((field, id) => {
          return (
            <Box 
              sx={{display: "flex", flexDirection: "row", alignItems: "center", gap: 2}}
              key={id}
            >
              <Typography>{field.id}</Typography>
              <TextField defaultValue={field.name} onChange={(e) => {changeName(e, id)}}></TextField>

              <Typography>Kentän tyyppi</Typography>
              <Select
                value={field.type}
                onChange={(e) => changeType(e, id)}
              >
                <MenuItem value={InputFormat.TEXT}>Teksti</MenuItem>
                <MenuItem value={InputFormat.NUMBER}>Numero</MenuItem>
                <MenuItem value={InputFormat.DATE}>Päivämäärä</MenuItem>
              </Select>

              <IconButton onClick={() => {deleteField(id)}}>
                <DeleteIcon />
              </IconButton>

              <Typography>{"Järjestys: " + field.sort}</Typography>

              <IconButton onClick={() => {changePriority(id, 1)}}>
                <ArrowUp />
              </IconButton>

              <IconButton onClick={() => {changePriority(id, -1)}}>
                <ArrowDown />
              </IconButton>
            </Box>
          );
        })}
      </Box>
    </Box>
  ]

  return(
    <Box m={2}>
      <Typography variant='h4'>Luo kokoelma</Typography>
      <Box mt={2}>
        <Stepper activeStep={activeStep}>
          {
            steps.map((step) => {
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
                  onClick={prevStep}  
                >Edellinen</Button>
                <Box sx={{flex: '1 1 auto'}}/>
                <Button
                  onClick={nextStep}
                >{activeStep === steps.length - 1 ? "Luo" : "Seuraava"}</Button>
              </Box>
            </Box>
          )
        
        }
      </Box>
    </Box>
  );
}

