import { Box, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react'

interface Props {

}

export const MainPage: React.FC<Props> = () => {
  const [registerPass, setRegisterPass] = useState("")
  const [registerUser, setRegisterUser] = useState("")

  const [loginPass, setLoginPass] = useState("")
  const [loginUser, setLoginUser] = useState("")

  const register = () => {
    axios({
      method: "POST",
      data: {
        username: registerUser,
        password: registerPass
      },
      withCredentials: true,
      url: "/api/register/"
    }).then((response) => console.log(response))
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
    }).then((response) => console.log(response))
  }


  return (
    <Box>
      <Typography>Collection Tracker</Typography>

      <Typography>Register</Typography>
      <TextField label="Username" onChange={(e) => {setRegisterUser(e.target.value)}}/>
      <TextField label="Password" type="password" onChange={(e) => {setRegisterPass(e.target.value)}}/>
      <Button onClick={register} variant="contained">Register</Button>
      
      <Typography>Login</Typography>
      <TextField label="Username" onChange={(e) => {setLoginUser(e.target.value)}}/>
      <TextField label="Password" type="password" onChange={(e) => {setLoginPass(e.target.value)}}/>
      <Button onClick={login} variant="contained">Login</Button>
    </Box>
  );
}