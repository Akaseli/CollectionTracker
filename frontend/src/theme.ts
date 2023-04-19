import { createTheme } from "@mui/material";
import { green, red } from "@mui/material/colors";

const theme = createTheme({
    palette: {
        primary: green,
        secondary: green,
        error: {
            main: red.A400
        }
    }
    
});

export default theme;
