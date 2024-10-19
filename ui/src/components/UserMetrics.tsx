import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Button,
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
      <CardContent>
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
            <Typography variant="caption" color="textSecondary">
              ID: {highlightText(user.id, searchQuery || "")}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
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
      <Box sx={{ display: "flex", justifyContent: "center" }}>
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
      </Box>
    </Card>
  );
};

export default UserMetrics;
