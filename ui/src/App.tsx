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
import GiftDialog from "./components/GiftDialog";

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
  const [users, setUsers] = useState<User[]>([]);
  const [loggedInUserId, setLoggedInUserId] = useState<string>("Guest");
  const [isLoading, setIsLoading] = useState(true);
  const [attemptingLogin, setAttemptingLogin] = useState(true);
  const [cbiMetrics, setCbiMetrics] = useState<CBIMetrics>({
    karma_decay_rate: 0,
    dharma_accrual_rate: 0,
    last_calculation: "",
    program_start: "",
  });
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const initializeWebSocket = async () => {
    webSocket.setOnMessage((event) => {
      const data = JSON.parse(event.data);
      if (data.type === "update_points") {
        console.log("Received updated points:", data);

        if (data.users.length === 0) {
          console.log("No users to update..?");
          return;
        }

        // Use a functional update to ensure the latest value of `users` is used.
        setUsers((prevUsers) => {
          const updatedUsers = data.users
            .map((user: Partial<User>) => {
              let updatedUser = prevUsers.find(
                (storedUser) => storedUser.id === user.id
              );

              if (updatedUser) {
                return { ...updatedUser, ...user };
              }
              return undefined;
            })
            .filter((user: User) => user !== undefined);

          const sortedUsers = [...updatedUsers].sort(
            (a, b) => b.karma_points - a.karma_points
          );

          return sortedUsers;
        });
      }
    });

    webSocket.setOnOpen((event) => {
      if (process.env.NODE_ENV === "production") return;
      console.log("WebSocket connection opened:", event);
    });
    webSocket.setOnClose((event) => {
      if (process.env.NODE_ENV === "production") return;
      console.log("WebSocket connection closed:", event);
    });
    webSocket.setOnError((error) => {
      if (process.env.NODE_ENV === "production") return;
      console.error("WebSocket error:", error);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setAttemptingLogin(true);

      try {
        // Fetch users and CBI metrics
        await Promise.all([fetchUsers(), fetchCBIMetrics()]);
        await restoreLoginSession();
        // Initialize WebSocket connection after fetching data
        initializeWebSocket();
      } catch (error: any) {
        console.error("Error fetching data:", error);
        showMessage(error.message, "info");
      } finally {
        setIsLoading(false);
        setAttemptingLogin(false);
      }
    };

    fetchData();

    return () => {
      // Remove WebSocket event handlers to avoid memory leaks
      webSocket.setOnMessage(null);
      webSocket.setOnOpen(null);
      webSocket.setOnClose(null);
      webSocket.setOnError(null);

      if (process.env.NODE_ENV === "production") return;
      console.log("Component unmounted - Cleaning up WebSocket handlers");
    };
  }, []);

  useEffect(() => {
    setMode(prefersDarkMode ? "dark" : "light");
  }, [prefersDarkMode]);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    if (!searchQuery) {
      const sortedUsers = [...users].sort(
        (a, b) => b.karma_points - a.karma_points
      );
      setFilteredUsers(sortedUsers);
      return;
    }
    const filtered = users.filter(
      (user) =>
        user?.username?.toLowerCase().includes(lowercasedQuery) ||
        user?.id?.toLowerCase().includes(lowercasedQuery)
    );
    const sortedUsers = [...filtered].sort(
      (a, b) => b.karma_points - a.karma_points
    );
    setFilteredUsers(sortedUsers);
  }, [searchQuery, users]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  const restoreLoginSession = async () => {
    if (!authService.getRefreshToken()) return;

    const authResponse = await authService.restoreLoginSession();
    const existingUser =
      authResponse?.user &&
      users.find((user) => user.id === authResponse.user.id);

    if (authResponse.user) {
      setLoggedInUserId(authResponse.user.id);
    }
  };

  const showMessage = (
    message: string,
    severity: "success" | "error" | "info" | "warning" = "info"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const hideMessage = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleGiftDharma = async ({
    recipientId,
    reason,
    amount,
  }: {
    recipientId: string;
    reason: string;
    amount: number;
  }) => {
    if (loggedInUserId === "Guest") {
      showMessage("You must be logged in to gift Dharma.", "error");
      return;
    }

    if (recipientId === loggedInUserId) {
      showMessage("You can't gift Dharma to yourself!", "warning");
      return;
    }

    try {
      const giftDharmaResponse = await userService.giftDharma({
        recipientId,
        reason,
        amount,
      });
      showMessage(giftDharmaResponse.message, "success");
      const fromUser = giftDharmaResponse.fromUser;
      const toUser = giftDharmaResponse.toUser;
      const updatedUsers = users.map((user) => {
        if (user.id === fromUser.id) {
          return { ...user, dharma_points: fromUser.dharma_points };
        } else if (user.id === toUser.id) {
          return { ...user, karma_points: toUser.karma_points };
        } else {
          return user;
        }
      });
      const sortedUsers = [...updatedUsers].sort(
        (a, b) => b.karma_points - a.karma_points
      );
      setUsers(sortedUsers);
    } catch (error: any) {
      console.error("Error gifting Dharma:", error);
      showMessage(
        error.message || "Failed to gift Dharma. Please try again.",
        "error"
      );
      return;
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await userService.getUsers();
      const sortedUsers = [...fetchedUsers].sort(
        (a, b) => b.karma_points - a.karma_points
      );
      setUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCBIMetrics = async () => {
    try {
      const metrics = await statsService.getCBIMetrics();
      setCbiMetrics(metrics);
    } catch (error) {
      console.error("Error fetching CBI metrics:", error);
      showMessage("Failed to fetch required metrics.", "error");
    }
  };

  const handleWeb3Login = async (
    address: string
  ): Promise<{
    message: string;
    handleSignedMessage: (signature: string) => Promise<void>;
  }> => {
    try {
      // Request the auth message from the server
      const { message, timestamp } = await authService.requestAuthMessage(
        address
      );
      const handleSignedMessage = async (signature: string) => {
        try {
          const authResponse = await authService.authenticate(
            address,
            signature,
            timestamp,
            message
          );
          if (authResponse.success) {
            showMessage(authResponse.message, "success");
            setLoggedInUserId(authResponse.user.id);
            fetchUsers(); // Refresh the user list after successful login
          } else if (authResponse.status === 202) {
            console.log("Login failed:", authResponse.message);
            showMessage(
              authResponse.message || "Login failed. Please try again.",
              "error"
            );
          }
        } catch (error: any | { status: number; message: string }) {
          console.error("Authentication error:", error);
          showMessage(
            "An error occurred during authentication. Please try again.",
            "error"
          );
        }
      };
      return { message, handleSignedMessage };
    } catch (error) {
      console.error("Error during login process:", error);
      showMessage(
        "An error occurred during the login process. Please try again.",
        "error"
      );
      // Return a default object to satisfy the type requirement
      return {
        message: "",
        handleSignedMessage: async () => {
          showMessage("Authentication failed. Please try again.", "error");
        },
      };
    }
  };

  const handleLogout = () => {
    authService.removeTokens();
    setLoggedInUserId("Guest");
  };

  const currentUser = users.find((user) => user?.id === loggedInUserId);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };


  const handleViewHistory = (userId: string) => {
    setSelectedUserId(userId);
  };
  const handleCloseHistory = () => {
    setSelectedUserId(null);
  };

  return (
    <SharedRefProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar
          position="static"
          sx={{
            backgroundColor: "transparent",
            boxShadow: "none",
            backgroundImage: "none",
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <IconButton
              sx={{ ml: 1 }}
              onClick={toggleColorMode}
              color="inherit"
            >
              {theme.palette.mode === "dark" ? (
                <Brightness7Icon />
              ) : (
                <Brightness4Icon color="primary" />
              )}
            </IconButton>
            <Box sx={{ flex: "1 1 auto" }}></Box>
            {!attemptingLogin && loggedInUserId !== "Guest" && (
              <Button onClick={handleLogout}>Logout</Button>
            )}
            {!attemptingLogin && loggedInUserId === "Guest" && (
              <Web3Login onLogin={handleWeb3Login} />
            )}
          </Toolbar>
        </AppBar>
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
        <Container maxWidth="lg">
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12}>
              {currentUser && loggedInUserId !== "Guest" && (
                <LoggedInUserMetrics
                  user={currentUser}
                  onViewHistory={handleViewHistory}
                />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {selectedUserId ? (
                <History
                  userId={selectedUserId}
                  username={
                    users.find((u) => u.id === selectedUserId)?.username || ""
                  }
                  users={[...users]}
                  onClose={handleCloseHistory}
                />
              ) : cbiMetrics ? (
                <CbiInfo
                  dharmaRate={cbiMetrics.dharma_accrual_rate}
                  karmaRate={cbiMetrics.karma_decay_rate}
                  programStart={cbiMetrics.program_start}
                  lastCalculation={cbiMetrics.last_calculation}
                />
              ) : null}
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom align="center">
                  Our Community Guardians
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search users by Name or Wallet Address"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  style={{ marginBottom: "20px" }}
                />
                {isLoading ? (
                  <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                  </Box>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <UserMetrics
                      key={user.id}
                      user={user}
                      currentUser={currentUser}
                      onGiftDharma={handleGiftDharma}
                      onViewHistory={handleViewHistory}
                      canGift={
                        !!currentUser &&
                        currentUser?.dharma_points >= 1 &&
                        loggedInUserId !== "Guest"
                      }
                      isSameUser={user.id === loggedInUserId}
                      searchQuery={searchQuery}
                    />
                  ))
                ) : (
                  <Box my={4} justifyContent={"center"} alignItems={"center"}>
                    {searchQuery && searchQuery.includes("0x") && (
                      <Typography align="center">
                        No users found for that wallet address.
                      </Typography>
                    )}
                    {searchQuery && !searchQuery.includes("0x") && (
                      <Typography align="center">
                        No users matched <strong>{searchQuery}</strong>.
                      </Typography>
                    )}
                    {!searchQuery && (
                      <Typography align="center">No users found.</Typography>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={hideMessage}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={SlideTransition}
        >
          <Alert
            onClose={hideMessage}
            severity={snackbar.severity}
            sx={{
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              "& .MuiAlert-message": {
                fontSize: "1.2rem", // Increase message font size
              },
              "& .MuiAlert-icon": {
                fontSize: "2rem", // Increase icon size
              },
              padding: "1rem", // Increase overall padding
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </SharedRefProvider>
  );
}
