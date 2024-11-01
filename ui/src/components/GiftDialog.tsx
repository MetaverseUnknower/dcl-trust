import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  Typography,
  FormHelperText,
} from "@mui/material";
import { User } from "../services/userService";

type ChooseNumberDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    recipientId: string;
    amount: number;
    reason: string;
  }) => void;
  giftingUser?: User;
  targetUser: User | null;
};

const ChooseNumberDialog: React.FC<ChooseNumberDialogProps> = ({
  open,
  onClose,
  onSubmit,
  giftingUser,
  targetUser,
}) => {
  const [selectedNumber, setSelectedNumber] = useState<number>(1);
  const [reason, setReason] = useState<string>("");
  const maxNumber = Math.floor(giftingUser?.dharma_points || 0);

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedNumber(Number(event.target.value));
  };

  const handleReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReason(event.target.value);
  };

  const handleSubmit = () => {
    console.log("submitting", selectedNumber, targetUser, reason);
    if (selectedNumber && targetUser) {
      onSubmit({ recipientId: targetUser?.id, amount: selectedNumber, reason });
      onClose();
    } else {
      onClose();
    }
    setSelectedNumber(1);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Send Karma to {targetUser?.username || "Someone"}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 1 }}>
          Your dharma points will convert to karma once sent to{" "}
          {targetUser?.username}
        </Typography>
        <TextField
          label="Dharma Points To Gift"
          type="number"
          value={selectedNumber}
          onChange={handleNumberChange}
          inputProps={{ min: 1, max: maxNumber }}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Reason (optional)"
          value={reason}
          onChange={handleReasonChange}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          inputProps={{ maxLength: 500 }}
          helperText={
            <FormHelperText
              style={{
                color: reason.length >= 200 ? "red" : "inherit",
                textAlign: "right",
                marginRight: 0
              }}
            >
              {reason.length}/500 characters
            </FormHelperText>
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={!selectedNumber}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChooseNumberDialog;
