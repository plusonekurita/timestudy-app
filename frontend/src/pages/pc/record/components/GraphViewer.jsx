import { Box, Typography, Paper } from "@mui/material";
// src/components/Charts/GraphViewer.jsx
import React from "react";

import DailyCategoryStackedChart from "./DailyCategoryStackedChart";
import StaffCategory100Chart from "./StaffCategory100Chart";
import StaffTypeMix100Chart from "./StaffTypeMix100Chart";
import HourStackedGraph from "./HourStackedGraph";
import HourCategoryHeatmap from "./HourCategoryHeatmap";

function ComingSoon({ title }) {
  return (
    <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography color="text.secondary">
        準備中です。次のスプリントで実装予定。
      </Typography>
    </Paper>
  );
}

export default function GraphViewer({ type }) {
  switch (type) {
    case "dailyCategoryStacked":
      return <DailyCategoryStackedChart />;

    case "staffType100":
      return <StaffTypeMix100Chart />; // ← 追加

    case "staffCategory100":
      return <StaffCategory100Chart />;

    case "hourStacked": // 一般職員用・時間帯×積み上げ
      return <HourStackedGraph />;

    case "hourCategoryHeatmap":
      return <HourCategoryHeatmap />;

    case "paretoCategory":
      return <ComingSoon title="カテゴリ別パレート" />;

    case "productivityQuadrant":
      return <ComingSoon title="生産性クォドラント" />;

    default:
      return (
        <Box sx={{ p: 4 }}>
          <Typography>未対応のグラフタイプです。</Typography>
        </Box>
      );
  }
}
