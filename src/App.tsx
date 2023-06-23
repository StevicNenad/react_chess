// App.tsx
import { getDatabase, ref, set } from "firebase/database";
import { useEffect } from "react";
import LandingPage from "./LandingPage";
import { ThemeProvider, createTheme } from "@mui/material/styles";

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
      <LandingPage />
    </ThemeProvider>
  );
};

export default App;
