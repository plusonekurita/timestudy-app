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
import DatePickerWithToday from "../../../components/DatePickerWithToday";
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
  const handleStartDateChange = (newStart) => {
    console.log(newStart);
    setStartDate(newStart);
    // 開始日を終了日より後に選択した場合は終了日も同じ日に変更
    // if (endDate && newStart.isAfter(endDate)) {
    setEndDate(newStart);
    // }
  };

  const handleEndDateChange = (newEnd) => {
    setEndDate(newEnd);
    // 終了日を開始日より前にしたら開始日も同じ日に変更
    if (startDate && newEnd.isBefore(startDate)) {
      setStartDate(newEnd); // ✅ 開始日を合わせる
    }
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
          <Box display="flex" justifyContent="space-around" width="100%">
            <DatePickerWithToday
              label="開始日"
              value={startDate}
              maxDate={today}
              onChange={handleStartDateChange}
              inputBorder={true}
            />
            <Typography sx={{ marginTop: "21px" }}>～</Typography>
            <DatePickerWithToday
              label="開始日"
              value={endDate}
              maxDate={today}
              minDate={startDate}
              onChange={handleEndDateChange}
              inputBorder={true}
            />
          </Box>
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
