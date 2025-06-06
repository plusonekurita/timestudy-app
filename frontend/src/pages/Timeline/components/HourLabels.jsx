import { Box, Typography } from "@mui/material";
// components/HourLabels.jsx
import React from "react";

import { getHourBlockHeight } from "../hooks/useNowIndicator";

const HourLabels = ({ grouped }) => {
  return (
    <Box sx={{ width: "60px", borderRight: "1px solid #ccc" }}>
      {Array.from({ length: 24 }, (_, hour) => {
        const items = grouped[hour.toString()] || [];
        const height = getHourBlockHeight(items.length);

        return (
          <Box
            key={hour}
            sx={{
              height,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              pt: "4px",
              borderBottom: "1px solid #eee",
              boxSizing: "border-box",
            }}
          >
            <Typography variant="caption">
              {`${String(hour).padStart(2, "0")}:00`}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default HourLabels;
