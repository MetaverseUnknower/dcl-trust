import React from "react";
import {
  Paper,
  Typography,
  Avatar,
  Box,
  Button,
  Container,
  Grid,
} from "@mui/material";
import { Star, Favorite, History } from "@mui/icons-material";
import { User } from "../services/userService";
import { useSharedRef } from "../App";

interface LoggedInUserMetricsProps {
  user: User;
  onViewHistory: (userId: string) => void;
}

const LoggedInUserMetrics: React.FC<LoggedInUserMetricsProps> = ({
  user,
  onViewHistory,
}) => {
  const sharedRef = useSharedRef();

  const handleScrollToTop = () => {
    if (sharedRef.current) {
      sharedRef.current.scrollIntoView({ behavior: "smooth" });
    }
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
            color="secondary"
            onClick={() => handleViewHistory(user.id)}
            startIcon={<History />}
            sx={{ m: 1 }}
          >
            View History
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LoggedInUserMetrics;
