import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Button,
  CardActions,
} from "@mui/material";
import { Star, Favorite, History, CardGiftcard } from "@mui/icons-material";
import { User } from "../services/userService";

interface UserMetricsProps {
  user: User;
  onGiftDharma: (recipientId: string) => void;
  onViewHistory: (userId: string) => void;
  canGift: boolean;
  isSameUser: boolean;
  searchQuery?: string;
}

const UserMetrics: React.FC<UserMetricsProps> = ({
  user,
  onGiftDharma,
  onViewHistory,
  canGift,
  isSameUser,
  searchQuery,
}) => {
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} style={{ backgroundColor: "yellow", padding: 0 }}>
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ pb: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            src={user.avatar_url}
            alt={`${user.username}'s avatar`}
            sx={{ width: 56, height: 56, mr: 2 }}
          />
          <Box>
            <Typography variant="h6">
              {highlightText(user.username, searchQuery || "")}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Recognized Since: {new Date(user.created_at).toLocaleDateString()}
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ fontSize: { xs: "0.7rem", lg: "1rem" } }}
            >
              {highlightText(user.id, searchQuery || "")}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Star color="primary" sx={{ mr: 1 }} /> Dharma: {user.dharma_points}
          </Typography>
          <Typography
            variant="body1"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Favorite color="secondary" sx={{ mr: 1 }} /> Karma:{" "}
            {user.karma_points}
          </Typography>
        </Box>
      </CardContent>
      <CardActions
        sx={{ display: "flex", justifyContent: "space-around", pt: 0 }}
      >
        {!isSameUser && (
          <Button
            size="small"
            color="info"
            onClick={() => onViewHistory(user.id)}
            startIcon={<History />}
            sx={{ mx: 4, my: 2, px: 2 }}
          >
            View History
          </Button>
        )}
        {!isSameUser && (
          <Button
            size="small"
            color="secondary"
            onClick={() => onGiftDharma(user.id)}
            startIcon={<CardGiftcard />}
            sx={{ mx: 4, my: 2, px: 2 }}
            disabled={!canGift}
          >
            Send Karma
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default UserMetrics;
