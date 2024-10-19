import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  ListItemIcon,
  Avatar,
  Collapse,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface CbiInfoProps {
  dharmaRate: number;
  karmaRate: number;
  programStart: string;
  lastCalculation: string | null;
}

const CbiInfo: React.FC<CbiInfoProps> = ({
  dharmaRate,
  karmaRate,
  programStart,
  lastCalculation,
}) => {
  function formatUTCDate(dateString: string): string {
    const date = new Date(dateString);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getUTCDate()).padStart(2, "0")} ${String(
      date.getUTCHours()
    ).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(
      2,
      "0"
    )}:${String(date.getUTCSeconds()).padStart(2, "0")} UTC`;
  }
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        About Decentraland Trust
      </Typography>
      <Box sx={{ m: 2 }}>
        <Typography paragraph>
          <strong>Decentraland Trust</strong> is an unofficial reputation system
          run by members of the Decentraland Community. It is designed to reward
          active and engaged members of the Decentraland community.
        </Typography>

        <Typography paragraph sx={{ mb: 4 }}>
          Establish a presence in Decentraland, contribute positively to the
          community, and watch your reputation grow!
        </Typography>
      </Box>
      <hr />

      <Box sx={{ m: 2 }}>
        <Typography
          variant="h6"
          gutterBottom
          align="center"
          sx={{ fontStyle: "italic" }}
        >
          OUR MISSION
        </Typography>
        <Typography paragraph>
          To foster a culture of trust and collaboration by recognizing and
          rewarding our Community Guardians
        </Typography>
      </Box>
      <hr />

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Requirements to Participate:
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Decentraland Name"
              secondary="You must have a registered Decentraland name associated with your Ethereum address."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
              primary="AND"
              secondary=" 5 or more of the required badges"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Decentraland Citizen (for 4 weeks)"
              secondary="Decentraland account is at least 4 weeks old"
            />
            <ListItemIcon>
              <Box
                component="img"
                src="https://assets-cdn.decentraland.org/dclcitizen/2d/normal.png"
                alt="Decentraland Citizen"
                sx={{ width: 48, height: 48, objectFit: "contain" }}
              />
            </ListItemIcon>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Land Architect"
              secondary="Deployed a scene to Genesis City"
            />
            <ListItemIcon>
              <Box
                component="img"
                src="https://assets-cdn.decentraland.org/land_architect/2d/normal.png"
                alt="Land Architect"
                sx={{ width: 48, height: 48, objectFit: "contain" }}
              />
            </ListItemIcon>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Fashionista (Bronze)"
              secondary="25 Wearables Purchased"
            />
            <ListItemIcon>
              <Box
                component="img"
                src="https://assets-cdn.decentraland.org/fashionista/bronze/2d/normal.png"
                alt="Fashionista (Bronze)"
                sx={{ width: 48, height: 48, objectFit: "contain" }}
              />
            </ListItemIcon>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Emotionista (Bronze)"
              secondary="10 Emotes Purchased"
            />
            <ListItemIcon>
              <Box
                component="img"
                src="https://assets-cdn.decentraland.org/emotionista/bronze/2d/normal.png"
                alt="Emotionista (Bronze)"
                sx={{ width: 48, height: 48, objectFit: "contain" }}
              />
            </ListItemIcon>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Event Enthusiast (Bronze)"
              secondary="50 Events Attended (for at least 5 min)"
            />
            <ListItemIcon>
              <Box
                component="img"
                src="https://assets-cdn.decentraland.org/event_enthusiast/bronze/2d/normal.png"
                alt="Event Enthusiast (Bronze)"
                sx={{ width: 48, height: 48, objectFit: "contain" }}
              />
            </ListItemIcon>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Wearable Designer (Starter)"
              secondary="1 Wearable Published"
            />
            <ListItemIcon>
              <Box
                component="img"
                src="https://assets-cdn.decentraland.org/wearable_designer/starter/2d/normal.png"
                alt="Wearable Designer (Starter)"
                sx={{ width: 48, height: 48, objectFit: "contain" }}
              />
            </ListItemIcon>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Emote Creator (Starter)"
              secondary="1 Emote Published"
            />
            <ListItemIcon>
              <Box
                component="img"
                src="https://assets-cdn.decentraland.org/emote_creator/starter/2d/normal.png"
                alt="Event Enthusiast (Starter)"
                sx={{ width: 48, height: 48, objectFit: "contain" }}
              />
            </ListItemIcon>
          </ListItem>
        </List>
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom>
          Reputation Metrics:
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Dharma"
              secondary="Represents your overall contribution and engagement in Decentraland. Starts at 0 for new users. Gets capped at 10 points. Slowly accrues over time."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Karma"
              secondary="Reflects the community's perception of your actions and contributions. Starts at 0 for new users. Slowly decays over time, turning back into Dharma."
            />
          </ListItem>
        </List>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Reputation Dynamics:
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Round One Starts:"
              secondary={`${formatUTCDate(programStart)} (${new Date(
                programStart
              ).toLocaleString()})`}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Dharma Accrual Rate"
              secondary={`${dharmaRate.toFixed(4)} points per minute`}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Karma Decay Rate"
              secondary={`${karmaRate.toFixed(4)} points per minute`}
            />
          </ListItem>
          {lastCalculation && (
            <ListItem>
              <ListItemText
                primary="Last Calculation"
                secondary={new Date(lastCalculation).toLocaleString()}
              />
            </ListItem>
          )}
        </List>
      </Box>
    </Paper>
  );
};

export default CbiInfo;
