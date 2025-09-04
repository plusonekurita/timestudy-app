import { Box, Paper, Typography } from "@mui/material";
import React from "react";

import { formatDurationFromTimes } from "../../../../utils/timeUtils";
import { getHourBlockHeight } from "../hooks/useNowIndicator";


const formatTime = (str) => {
  const d = new Date(str);
  return d.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const TimelineItems = ({ grouped }) => {
  return (
    <Box sx={{ flexGrow: 1, width: "100%" }}>
      {Array.from({ length: 24 }, (_, hour) => {
        const items = grouped[hour.toString()] || [];
        const height = getHourBlockHeight(items.length);

        return (
          <Box
            key={hour}
            sx={{
              height,
              position: "relative",
              borderBottom: "1px solid #eee",
              boxSizing: "border-box",
            }}
          >
            {items.map((item, i) => (
              <Paper
                key={i}
                sx={{
                  position: "absolute",
                  top: i * 56 + 4,
                  left: 8,
                  right: 8,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  backgroundColor: item.backgroundColor,
                  border: `1px solid ${item.color || "#ccc"}`,
                  borderLeft: `8px solid ${item.color || "#2196f3"}`,
                  boxSizing: "border-box",
                  paddingRight: "6px",
                  paddingLeft: "6px",
                }}
                elevation={0}
              >
                {item.icon && (
                  <Box
                    className="icon-wrapper"
                    sx={{
                      width: 35,
                      height: 35,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: item.color || "#999", // 円の背景色
                      borderRadius: "50%", // 円形
                      "& img": {
                        width: "25px",
                        height: "25px",
                      },
                    }}
                  >
                    {item.icon}
                  </Box>
                )}
                <Box sx={{ flex: 1, textAlign: "left" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      noWrap
                      sx={{ color: item.color, fontWeight: "bold" }}
                    >
                      {item.label || item.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: item.color, fontWeight: "bold" }}
                    >
                      {formatDurationFromTimes(item.startTime, item.endTime)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: item.color }}>
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        );
      })}
    </Box>
  );
};

export default TimelineItems;
