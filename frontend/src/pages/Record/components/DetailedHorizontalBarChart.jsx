import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Box, Typography } from "@mui/material";
// src/components/DetailedHorizontalBarChart.jsx
import React from "react";

import { colors } from "../../../constants/theme";
import CustomYAxisTick from "./CustomYAxisTick";

const DetailedHorizontalBarChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <Box sx={{ width: "100%", mt: 3, pb: "70px" }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: "bold", textAlign: "left" }}
      >
        業務別時間
      </Typography>

      <Box sx={{ width: "210px", mr: "auto" }}>
        <Typography
          sx={{
            fontSize: "12px",
            color: colors.textDark,
            fontWeight: "bold",
            textAlign: "right",
          }}
        >
          (分)
        </Typography>
      </Box>

      <ResponsiveContainer width="100%" height={data.length * 35 + 10}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 5, left: 5, bottom: 5 }}
        >
          <XAxis type="number" unit="秒" hide />
          <YAxis
            dataKey="label"
            type="category"
            width={210}
            tick={<CustomYAxisTick detailedChartData={data} />}
            tickLine={false}
            axisLine={false}
          />
          <Bar dataKey="duration" name="活動時間" fill={colors.directCare} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default DetailedHorizontalBarChart;
