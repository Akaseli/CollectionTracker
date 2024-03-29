import { Alert, Box, Button, Container, Divider, Grid, Snackbar, SnackbarCloseReason, Stack, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { userLogin } from '../app/userSlice';

interface Props {

}

export const MainPage: React.FC<Props> = () => {
  const [registerPass, setRegisterPass] = useState("")
  const [registerUser, setRegisterUser] = useState("")

  const [loginPass, setLoginPass] = useState("")
  const [loginUser, setLoginUser] = useState("")

  const [snackbar, openSnackbar] = useState(false)
  const [snackMessage, changeMessage] = useState("")

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const register = () => {
    axios({
      method: "POST",
      data: {
        username: registerUser,
        password: registerPass
      },
      withCredentials: true,
      url: "/api/register/"
    }).then((response) => {
      //Successfull
      if(response.data.status == "success"){
        //Fetch account info 

      }
      else{
        changeMessage(response.data.message);
        openSnackbar(true);
      }
    })
  }

  const login = () => {
    axios({
      method: "POST",
      data: {
        username: loginUser,
        password: loginPass
      },
      withCredentials: true,
      url: "/api/login/",
    }).then((response) => {
      //Successfull
      if(response.data.status == "success"){
        dispatch(userLogin({id: response.data.id, username: response.data.username}))

        navigate("/collections/")
      }
      else{
        changeMessage(response.data.message);
        openSnackbar(true);
      }
    })
  }

  const handleClose = (event: React.SyntheticEvent | Event, reason: SnackbarCloseReason) => {
    if(reason === "clickaway"){
      return;
    }

    openSnackbar(false)
  }

  return (
    <Box m={2}>
      <Typography variant="h4">Sovelluksen nimi</Typography>

      <Snackbar 
        open={snackbar}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert severity="error">
          {snackMessage}
        </Alert>
      </Snackbar>

      <Container maxWidth={"xs"}>
        <Stack spacing={2} divider={<Divider/>}>
          <Stack spacing={2}>
            <Typography variant='h5'>Kirjaudu</Typography>
            <TextField label="Käytäjänimi" onChange={(e) => {setLoginUser(e.target.value)}}/>
            <TextField label="Salasana" type="password" onChange={(e) => {setLoginPass(e.target.value)}}/>
            <Button onClick={login} variant="contained">Kirjaudu</Button>
          </Stack>

          <Stack spacing={2}>
            <Typography variant='h5'>Luo tili</Typography>
            <TextField label="Käytäjänimi" onChange={(e) => {setRegisterUser(e.target.value)}}/>
            <TextField label="Salasana" type="password" onChange={(e) => {setRegisterPass(e.target.value)}}/>
            <Button onClick={register} variant="contained" fullWidth>Luo tili</Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}