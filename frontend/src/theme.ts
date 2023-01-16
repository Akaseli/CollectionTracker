import { createTheme } from "@mui/material";
import { blue, cyan, green, red } from "@mui/material/colors";

const theme = createTheme({
    palette: {
        primary: {
            main: green.A400,
        },
        secondary: {
            main: blue.A400
        },
        error: {
            main: red.A400
        }
    }
});

export default theme;