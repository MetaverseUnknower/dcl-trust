import React, { useState, useEffect, Fragment } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import { User, userService } from "../services/userService";
import { DharmaTransaction } from "../models/History";
import {
  ArrowBackOutlined,
  ArrowForwardOutlined,
  Close as CloseIcon,
  Favorite,
  Star,
} from "@mui/icons-material";

interface TransactionHistoryProps {
  users: User[];
  userId: string;
  username: string;
  onClose: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  users,
  userId,
  username,
  onClose,
}) => {
  const [transactions, setTransactions] = useState<DharmaTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const data = await userService.getUserTransactions(userId);
        const sortedTransactions = data.sort(
          (a, b) => b.timestamp - a.timestamp
        );
        setTransactions(sortedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  const getUsername = (userId: string) => {
    return users.find((user) => user.id === userId)?.username || userId;
  };

  const renderSecondaryText = (transaction: DharmaTransaction) => {
    return (
      <>
        <Typography
          sx={{
            color: "#ccc",
            flex: "0 0 auto",
            fontSize: "0.8rem",
            textWrap: "wrap",
            maxWidth: "250px",
          }}
        >
          {transaction.reason || "No reason provided"}
        </Typography>
        <Typography
          sx={{
            color: "#ccc",
            flex: "0 0 auto",
            fontSize: "0.6rem",
          }}
        >
          {new Date(transaction.timestamp).toLocaleString()}
        </Typography>
      </>
    );
  };

  return (
    <Paper
      sx={{ p: 2, height: "100%", overflowY: "auto", position: "relative" }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          mb: 2,
        }}
      >
        <IconButton onClick={onClose} color="inherit">
          <CloseIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" align="center">
          Gifting History for {username}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        {loading ? (
          <CircularProgress />
        ) : transactions.length > 0 ? (
          <List
            sx={{ display: "flex", flexDirection: "column", width: "100%" }}
          >
            {transactions.map((transaction, index) => {
              if (transaction.fromUserId === userId) {
                return (
                  <ListItem
                    key={index}
                    sx={{ justifyContent: "start", alignItems: "center" }}
                  >
                    <Star sx={{ mt: -2, mr: 2 }} color="primary" />
                    <ListItemText
                      primary={`Awarded ${transaction.amount} Dharma point${
                        transaction.amount > 1 ? "s" : ""
                      } to ${getUsername(transaction.toUserId)}`}
                      secondary={renderSecondaryText(transaction)}
                      sx={{
                        textAlign: "left",
                        color: "#90caf9",
                      }}
                    />
                  </ListItem>
                );
              } else if (transaction.fromUserId !== userId) {
                return (
                  <>
                    <ListItem
                      key={index}
                      sx={{ justifyContent: "end", alignItems: "center" }}
                    >
                      <ListItemText
                        color="pink"
                        primary={`${getUsername(
                          transaction.fromUserId
                        )} awarded ${transaction.amount} Karma point${
                          transaction.amount > 1 ? "s" : ""
                        }`}
                        secondary={renderSecondaryText(transaction)}
                        sx={{
                          textAlign: "right",
                          color: "#ce93d8",
                          flex: "0 0 auto",
                        }}
                      />
                      <Favorite sx={{ mt: -2, ml: 2 }} color="secondary" />
                    </ListItem>
                  </>
                );
              }
            })}
          </List>
        ) : (
          <Typography>No transactions found.</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default TransactionHistory;
