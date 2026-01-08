// src/pages/RecordsPage
import "dayjs/locale/ja";
import "./style.css";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Typography } from "@mui/material";
import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
  const [calendarOpen, setCalendarOpen] = useState(false);
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

  const formatDateRange = () => {
    if (!startDate || !endDate) {
      return "日付を選択";
    }
    if (startDate.isSame(endDate, "day")) {
      return startDate.format("YYYY年M月D日(ddd)");
    }
    return `${startDate.format("M月D日")} 〜 ${endDate.format("M月D日")}`;
  };

  const handleOpenCalendar = () => {
    setCalendarOpen(true);
  };

  const handleCloseCalendar = () => {
    setCalendarOpen(false);
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
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<CalendarMonthIcon />}
              endIcon={<ExpandMoreIcon />}
              onClick={handleOpenCalendar}
              sx={{
                minWidth: "200px",
                justifyContent: "space-between",
              }}
            >
              {formatDateRange()}
            </Button>
          </Box>

          <Dialog
            open={calendarOpen}
            onClose={handleCloseCalendar}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                m: 2,
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                width: "calc(100% - 32px)",
                maxWidth: "calc(100% - 32px)",
              },
            }}
          >
            <DialogContent
              sx={{
                p: 0,
                overflow: "hidden",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                width: "100%",
                maxWidth: "100%",
              }}
            >
              <RangeDateSelector
                startDate={startDate}
                endDate={endDate}
                maxDate={today}
                onChange={handleRangeChange}
                onSelectionComplete={handleCloseCalendar}
              />
            </DialogContent>
          </Dialog>
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
