import { Box } from '@mui/system';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { RootState } from './app/store';
import { userLogin } from './app/userSlice';
import { CollectionPage } from './pages/Collection';
import { CollectionsPage } from './pages/Collections';
import { CreateCollectionPage } from './pages/CreateCollection';
import { MainPage } from './pages/Main';

function App(){

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.user)

  useEffect(() => {
    if(!user.id){
      axios.get("/api/user").then((response) => {
        dispatch(userLogin(response.data))
      })
      .catch((error) => {
        console.log(error)
        navigate("/")
      })  
    }
  }, [])

  return(
    <Box>
      <Routes>
        <Route path="/" element={<MainPage />}/>
          <Route path="/collections/" element={<CollectionsPage />}/>
            <Route path="/collections/create/" element={<CreateCollectionPage />}/>
            <Route path="/collections/:id/" element={<CollectionPage />}/>
      </Routes>
    </Box>
  );
}

export default App;