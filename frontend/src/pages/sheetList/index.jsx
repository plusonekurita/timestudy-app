import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useNavigate } from "react-router-dom";
import React from "react";

import { sheetItems } from "../../constants/list";
import { colors } from "../../constants/theme";

const SheetListPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <List sx={{ p: 0 }}>
        {sheetItems.map((item) => (
          <>
            <ListItem
              key={item.id}
              disablePadding
              sx={{
                py: 1.2,
                px: 2,
              }}
            >
              <ListItemButton onClick={() => navigate(item.path)}>
                <ListItemText
                  primary={item.name}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                      },
                    },
                  }}
                />
                <PlayArrowIcon sx={{ color: colors.text }} />
              </ListItemButton>
            </ListItem>
            <Divider />
          </>
        ))}
      </List>
    </Box>
  );
};

export default SheetListPage;
