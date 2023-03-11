import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import ReactCrop, { Crop } from 'react-image-crop';

interface Props {
  open: boolean,
  onClose: () => void
  fields: JSX.Element[]
  uploadUrl: string
}

export const CreateCollectibleDialog: React.FC<Props> = ({open, onClose, fields, uploadUrl}) => {
  const [collectibleName, setCollectibleName] = useState("")
  const [collectibleDescription, setCollectibleDescription] = useState("")

  const [collectbieCustomFields, setCollectibleCustomFields] = useState({})

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

  const createCollectible = () => {
    if(!image) return
    
    axios.post(
      uploadUrl,
      {
        name: collectibleName,
        description: collectibleDescription,
        image: image,
        crop: JSON.stringify(crop),
        values: JSON.stringify(collectbieCustomFields),
        scaleX: scaleX,
        scaleY: scaleY
      },
      {
        headers: {
          "content-type": "multipart/form-data"
        }
      }
    ).then(() => {
      setCollectibleName("")
      setCollectibleDescription("")
      setCollectibleCustomFields({})
      onClose()
    })
  }

  const handleImage = (e:any) => {
    setUrl(URL.createObjectURL(e.target.files[0]))
    setImage(e.target.files[0])
  }

  useEffect(() => {
    if(previewImage.current){
      setXScale(previewImage.current.naturalWidth/previewImage.current.width)
      setYScale(previewImage.current.naturalHeight/previewImage.current.height)
    }
  })

  return(
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Uusi keräiltävä</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Täytä perustiedot.
          </DialogContentText>
          <TextField
            autoFocus
            margin='dense'
            fullWidth
            label="Nimi"
            defaultValue={collectibleName}
            onChange={(e) => {
              setCollectibleName(e.target.value)
            }}
          />
          <TextField
            margin='dense'
            fullWidth
            label="Kuvaus"
            defaultValue={collectibleDescription}
            onChange={(e) => {
              setCollectibleDescription(e.target.value)
            }}
          />

          <DialogContentText>
            Kuva
          </DialogContentText>

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

          <DialogContentText>
            Käyttäjän itse määrittelemät kentät
          </DialogContentText>
          
          {
            fields
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Peruuta</Button>
          <Button onClick={createCollectible}>Lisää</Button>
        </DialogActions>
    </Dialog>
  );
}