import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import {
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  useMediaQuery,
  CssBaseline,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  SlideProps,
  Slide,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import UserMetrics from "./components/UserMetrics";
import LoggedInUserMetrics from "./components/LoggedInUserMetrics";
import Web3Login from "./components/Web3Login";
import History from "./components/History";
import { userService, User } from "./services/userService";
import CbiInfo from "./components/CbiInfo";
import { authService } from "./services/authService";
import { CBIMetrics, statsService } from "./services/statsService";
import { webSocket } from "./services/websocketService";
import logoLight from "./assets/images/logo-light.png";
import logoDark from "./assets/images/logo-dark.png";

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

const SharedRefContext = createContext<React.RefObject<HTMLDivElement> | null>(
  null
);

export const SharedRefProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const topRef = useRef<HTMLDivElement>(null);
  return (
    <SharedRefContext.Provider value={topRef}>
      {children}
    </SharedRefContext.Provider>
  );
};

export const useSharedRef = () => {
  const context = useContext(SharedRefContext);
  if (context === null) {
    throw new Error("useSharedRef must be used within a SharedRefProvider");
  }
  return context;
};

export default function App() {
  const [mode, setMode] = useState<"light" | "dark">("light");
 
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");


  useEffect(() => {
    setMode(prefersDarkMode ? "dark" : "light");
  }, [prefersDarkMode]);


  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );
 
  console.log("Thanks to DoctorDripp for calling me a cash grabbing racist!");
  console.log("Guess I'm going to stop paying to build and host cool shit and live up to the accusation.");


  return (
    <SharedRefProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 2,
          }}
        >
          <img
            src={mode == "dark" ? logoDark : logoLight}
            alt="Decentraland Trust"
            style={{ margin: "0 auto", width: "700px", maxWidth: "90%" }}
          />
        </Box>
        <Box sx={{ maxWidth: 640, margin: "0 auto" }}>
          <Typography variant="h4" sx={{ textAlign: "center", m: 6 }}>
            Notice of Cancellation
          </Typography>
          <Typography variant="body1" align="center">
            The Decentraland Trust experiment has been cancelled.
            <br />
            Originally designed as a peer-to-peer digital reputation system, the
            project sought to enhance trust and promote positive collaboration
            within the Decentraland community. <br />
            Due to certain challenges and changing priorities within the
            ecosystem,
            <br />
            the decision has been made to discontinue this initiative.
            <br />
            <br />
            Thank you to all who participated and supported Decentraland Trust.
          </Typography>
        </Box>
      </ThemeProvider>
    </SharedRefProvider>
  );
}
