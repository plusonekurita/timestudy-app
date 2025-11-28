// src/pages/RecordsPage
import "dayjs/locale/ja";
import "./style.css";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Typography } from "@mui/material";
import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import dayjs from "dayjs";

import DetailedHorizontalBarChart from "./components/DetailedHorizontalBarChart";
import FullscreenProgressBar from "../../../components/FullscreenProgressBar";
import CategoryStackedBarChart from "./components/CategoryStackedBarChart";
import RangeDateSelector from "./components/RangeDateSelector";
import CategorySummaryList from "./components/CategorySummaryList";
import { useFetchRecords } from "../../../hooks/useFetchRecords";
import { useRecordData } from "../../../hooks/useRecordData";


const RecordsPage = () => {
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const today = dayjs();

  // カスタムフックで各グラフに表示するデータを取得
  const { records, loading } = useFetchRecords(startDate, endDate);
  const { chartData, summaryData, detailedChartData } = useRecordData(
    records,
    startDate,
    endDate
  );

  // カレンダー操作
  const handleRangeChange = (nextStart, nextEnd) => {
    if (!nextStart || !nextEnd) {
      return;
    }
    setStartDate(nextStart);
    setEndDate(nextEnd);
  };

  return (
    <Box
      sx={{
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        pt: 3,
        pr: 1,
        pl: 1,
      }}
    >
      <FullscreenProgressBar loading={loading} />
      <>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
          <RangeDateSelector
            startDate={startDate}
            endDate={endDate}
            maxDate={today}
            onChange={handleRangeChange}
          />
        </LocalizationProvider>

        <Grid container sx={{ width: "100%", mt: 2 }}>
          <Grid item xs={12} sx={{ textAlign: "left" }}>
            <Typography sx={{ fontWeight: "bold" }}>
              カテゴリ別グラフ
            </Typography>
          </Grid>
        </Grid>
        {/* 積み上げ横棒グラフ */}
        <CategoryStackedBarChart chartData={chartData} />

        {/* 積み上げ横棒グラフの統計情報 */}
        <CategorySummaryList summaryData={summaryData} />

        {detailedChartData.length > 0 && (
          <DetailedHorizontalBarChart data={detailedChartData} />
        )}
      </>
    </Box>
  );
};

export default RecordsPage;
