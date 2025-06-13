import { Box, Typography } from "@mui/material";
// src/components/CustomYAxisTick.jsx
import React from "react";

import { colors } from "../../../constants/theme";

const CustomYAxisTick = ({ y, payload, index, width, detailedChartData }) => {
  const labelText = payload.value;
  const foreignObjectX = 0;
  const foreignObjectY = y - 8;

  return (
    <foreignObject
      x={foreignObjectX}
      y={foreignObjectY}
      width={width}
      height={16}
      style={{ overflow: "visible" }}
    >
      <Box
        xmlns="http://www.w3.org/1999/xhtml"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          pr: 0.5,
        }}
      >
        <div>
          <Typography
            variant="caption"
            sx={{
              mr: 0.5,
              color: colors.textDark,
              fontWeight: "bold",
              textAlign: "left",
            }}
          >
            {index + 1}
          </Typography>
        </div>
        <div>
          <Typography
            variant="caption"
            noWrap
            title={labelText}
            sx={{
              color: colors.textDark,
              textAlign: "right",
              pr: 2,
              fontWeight:
                detailedChartData[index]?.duration > 0 ? "bold" : "normal",
            }}
          >
            {labelText}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: colors.textDark,
              fontWeight:
                detailedChartData[index]?.duration > 0 ? "bold" : "normal",
              minWidth: "3.5em",
              pr: "4px",
            }}
          >
            {`${Math.round((detailedChartData[index]?.duration || 0) / 60)}`}
          </Typography>
        </div>
      </Box>
    </foreignObject>
  );
};

export default CustomYAxisTick;
