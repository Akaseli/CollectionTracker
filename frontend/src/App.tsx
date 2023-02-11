import { Box } from '@mui/system';
import { Routes, Route } from 'react-router-dom';
import { CollectionPage } from './pages/Collection';
import { CollectionsPage } from './pages/Collections';
import { CreateCollectionPage } from './pages/CreateCollection';
import { MainPage } from './pages/Main';

function App(){
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