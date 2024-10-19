import React from "react";
import { Paper, Typography, Avatar, Box, Button } from "@mui/material";
import { Star, Favorite, History } from "@mui/icons-material";
import { User } from "../services/userService";

interface LoggedInUserMetricsProps {
  user: User;
  onViewHistory: (userId: string) => void;
}

const LoggedInUserMetrics: React.FC<LoggedInUserMetricsProps> = ({
  user,
  onViewHistory,
}) => {
  return (
    <Paper
      elevation={3}
      sx={{ p: 2, mb: 3, display: "flex", alignItems: "center" }}
    >
      <Avatar
        src={user.avatar_url}
        alt={`${user.username}'s avatar`}
        sx={{ width: 60, height: 60, mr: 2 }}
      />
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Typography variant="h6" gutterBottom>
          Logged in as: {user.username}
        </Typography>
        <Typography variant="body2" gutterBottom>
          ID: {user.id}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Typography variant="body1" sx={{ px: 2 }}>
            <Star color="primary" sx={{ verticalAlign: "middle", mr: 0.5 }} />
            Dharma: {user.dharma_points}
          </Typography>
          <Typography variant="body1" sx={{ px: 2 }}>
            <Favorite
              color="secondary"
              sx={{ verticalAlign: "middle", mr: 0.5 }}
            />
            Karma: {user.karma_points}
          </Typography>
        </Box>
        <Box sx={{ width: "100%", display: "flex", justifyContent: "end" }}>
          <Button
            size="small"
            color="secondary"
            onClick={() => onViewHistory(user.id)}
            startIcon={<History />}
            sx={{ m: 1 }}
          >
            View History
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default LoggedInUserMetrics;
