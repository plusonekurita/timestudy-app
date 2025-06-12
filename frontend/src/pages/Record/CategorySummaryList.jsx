import { Box, Grid, Typography } from "@mui/material";
// src/components/CategorySummaryList
import React from "react";

import { formatDurationFromMinutes } from "../../utils/timeUtils";
import { colors } from "../../constants/theme";

const CategorySummaryList = ({ summaryData }) => {
  if (!summaryData || summaryData.length === 0) {
    return (
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ textAlign: "center", mt: 2 }}
      >
        記録データがありません。
      </Typography>
    );
  }

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      {summaryData.map((item, index) => (
        <Grid
          container
          alignItems="center"
          spacing={1}
          key={index}
          sx={{ mb: 1, pl: 1, pr: 1, justifyContent: "space-between" }}
        >
          <Grid size={4} sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                mr: 1,
                width: 16,
                height: 16,
                backgroundColor: item.color,
                borderRadius: "4px",
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {item.label}
            </Typography>
          </Grid>
          <Grid size={4}>
            <Typography
              variant="body2"
              sx={{ textAlign: "right", color: colors.textDark }}
            >
              {formatDurationFromMinutes(item.durationMinutes)}
            </Typography>
          </Grid>
          <Grid size={4}>
            <Typography variant="body2" sx={{ textAlign: "right" }}>
              {item.percentage}%
            </Typography>
          </Grid>
        </Grid>
      ))}
    </Box>
  );
};

export default CategorySummaryList;
