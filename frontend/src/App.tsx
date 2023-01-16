import { Box } from '@mui/system';
import { Routes, Route } from 'react-router-dom';
import { MainPage } from './pages/Main';

function App(){
  return(
    <Box>
      <Box sx={{
        m: 1
      }}>
        <Routes>
          <Route path="/" element={<MainPage />}/>
        </Routes>
      </Box>
    </Box>
  );
}

export default App;