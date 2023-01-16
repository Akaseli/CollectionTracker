import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import theme from './theme';

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline/>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </ThemeProvider>,
  document.getElementById('root')
);