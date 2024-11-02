import React from "react";
import {
  Paper,
  Typography,
  Avatar,
  Box,
  Button,
  Grid,
  Dialog,
  Select,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { Star, Favorite, History, EditNote } from "@mui/icons-material";
import { User, userService } from "../services/userService";
import { useSharedRef } from "../App";

interface LoggedInUserMetricsProps {
  user: User;
  onViewHistory: (userId: string) => void;
  onUpdateDisplayName: (displayName: string) => void;
}

const LoggedInUserMetrics: React.FC<LoggedInUserMetricsProps> = ({
  user,
  onViewHistory,
  onUpdateDisplayName,
}) => {
  const [showEditDisplayName, setShowEditDisplayName] = React.useState(false);
  const [displayName, setDisplayName] = React.useState(user.username);
  const sharedRef = useSharedRef();

  const handleScrollToTop = () => {
    if (sharedRef.current) {
      sharedRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleEditDisplayName = (userId: string) => {
    setShowEditDisplayName(true);
  };

  const handleSaveDisplayName = async () => {
    setShowEditDisplayName(false);
    onUpdateDisplayName(displayName);
  };

  const handleViewHistory = (userId: string) => {
    onViewHistory(userId);
    handleScrollToTop();
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2}>
        <Grid
          item
          xs={12}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Avatar
            src={user.avatar_url}
            alt={`${user.username}'s avatar`}
            sx={{
              // Responsive width and height
              width: {
                xs: 60, // Smaller size on extra-small screens (mobile)
                sm: 90, // Default size on small screens (tablet)
                md: 100, // Larger size on medium screens
                lg: 100, // Largest size on large screens
              },
              height: {
                xs: 60,
                sm: 90,
                md: 100,
                lg: 100,
              },
              mr: 2, // Margin to the right
            }}
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={12}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            align="center"
            sx={{
              fontSize: {
                xs: "0.75rem", // Smaller font size on extra-small screens (mobile)
                sm: "1rem", // Slightly larger on small screens (tablet)
                md: "1.2rem", // Larger font size on medium screens (desktop)
                lg: "1.5rem", // Even larger on large screens
              },
              m: 0,
            }}
          >
            Logged in as: {user.username}
          </Typography>
          <Typography
            variant="body2"
            gutterBottom
            align="center"
            sx={{
              fontSize: {
                xs: "0.75rem", // Smaller font size on extra-small screens (mobile)
                sm: "1rem", // Slightly larger on small screens (tablet)
                md: "1.2rem", // Larger font size on medium screens (desktop)
                lg: "1.5rem", // Even larger on large screens
              },
              m: 0,
            }}
          >
            {user.id}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            display: "flex",
            justifyContent: "space-around",
            pt: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              px: 2,
              fontSize: {
                xs: "1rem", // Smaller font size on extra-small screens (mobile)
                sm: "1.25rem", // Slightly larger on small screens (tablet)
                md: "1.5rem", // Larger font size on medium screens (desktop)
                lg: "1.75rem", // Even larger on large screens
              },
            }}
            align="center"
          >
            <Star color="primary" sx={{ verticalAlign: "middle", mr: 0.5 }} />
            Dharma: {user.dharma_points}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              px: 2,
              fontSize: {
                xs: "1rem", // Smaller font size on extra-small screens (mobile)
                sm: "1.25rem", // Slightly larger on small screens (tablet)
                md: "1.5rem", // Larger font size on medium screens (desktop)
                lg: "1.75rem", // Even larger on large screens
              },
            }}
            align="right"
          >
            <Favorite
              color="secondary"
              sx={{ verticalAlign: "middle", mr: 0.5 }}
            />
            Karma: {user.karma_points}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{ display: "flex", justifyContent: "end", pt: 1 }}
        >
          <Button
            size="small"
            color="primary"
            onClick={() => handleEditDisplayName(user.id)}
            startIcon={<EditNote />}
            sx={{ m: 1 }}
          >
            Edit Display Name
          </Button>
          <Button
            size="small"
            color="secondary"
            onClick={() => handleViewHistory(user.id)}
            startIcon={<History />}
            sx={{ m: 1 }}
          >
            View History
          </Button>
        </Grid>
      </Grid>
      <Dialog
        open={showEditDisplayName}
        onClose={() => setShowEditDisplayName(false)}
      >
        <DialogTitle>Edit Display Name</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <DialogContentText variant="body1" align="center" gutterBottom>
              Choose the name you'd like to show on Decentraland Trust
            </DialogContentText>
            <FormControl fullWidth margin="normal">
              <InputLabel id="display-name-label">Display Name</InputLabel>
              <Select
                labelId="display-name-label"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                label="Display Name"
                fullWidth
              >
                {user.decentraland_names &&
                user.decentraland_names.length > 0 ? (
                  user.decentraland_names.map((name: string) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value={user.username}>{user.username}</MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDisplayName(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSaveDisplayName}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default LoggedInUserMetrics;
