import {createTheme, ThemeProvider} from "@mui/material/styles";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import GamePage from "./pages/game/GamePage";
import HomePage from "./pages/home/HomePage";

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#ccc",
        },
    },
});

const App = () => {

    return (
        <ThemeProvider theme={theme}>
            <BrowserRouter basename="/">
                <Routes>
                    <Route path={process.env.REACT_APP_BASE_PATH} element={<HomePage/>}/>
                    <Route path={process.env.REACT_APP_BASE_PATH +"lobby/:id"} element={<GamePage/>}/>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;
