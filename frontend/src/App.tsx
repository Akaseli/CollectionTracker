import { Box } from '@mui/system';
import { Routes, Route } from 'react-router-dom';
import { CollectionPage } from './pages/Collections';
import { CreateCollectionPage } from './pages/CreateCollection';
import { MainPage } from './pages/Main';

function App(){
  return(
    <Box>
      <Box sx={{
        m: 1
      }}>
        <Routes>
          <Route path="/" element={<MainPage />}/>
            <Route path="/collections/" element={<CollectionPage />}/>
              <Route path="/collections/create/" element={<CreateCollectionPage />}/>
        </Routes>
      </Box>
    </Box>
  );
}

export default App;