// src/pages/RecordsPage
import "dayjs/locale/ja";
import "./style.css";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import TimelineIcon from "@mui/icons-material/Timeline";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
// import SmartToyIcon from "@mui/icons-material/SmartToy"; // AI判定アイコン
import { Typography, IconButton } from "@mui/material";
import SpeedDial from "@mui/material/SpeedDial";
import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import dayjs from "dayjs";

import DetailedHorizontalBarChart from "./components/DetailedHorizontalBarChart";
import FullscreenProgressBar from "../../components/FullscreenProgressBar";
import CategoryStackedBarChart from "./components/CategoryStackedBarChart";
import DatePickerWithToday from "../../components/DatePickerWithToday";
import CategorySummaryList from "./components/CategorySummaryList";
import { useFetchRecords } from "../../hooks/useFetchRecords";
import { useRecordData } from "../../hooks/useRecordData";
import TimelineView from "./TimelineView";

const RecordsPage = () => {
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false); // タイムライン表示状態
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

  // ボタンアクションを開く
  const handleSpeedDialOpen = () => setOpenSpeedDial(true);
  // ボタンアクションを閉じる
  const handleSpeedDialClose = () => setOpenSpeedDial(false);

  // ボタンアクション一覧
  const speedDialActions = [
    {
      icon: <TimelineIcon />,
      name: "タイムライン",
      handleClick: () => {
        setShowTimeline(true);
        handleSpeedDialClose(); // ボタンアクションを閉じる
      },
    },
    // {
    //   icon: <SmartToyIcon />,
    //   name: "AI判定",
    //   handleClick: () => {
    //     console.log("AI Judge action clicked");
    //     // TODO: AI判定処理を実装
    //   },
    // },
  ];

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
        pt: showTimeline ? 0 : 3,
        pr: showTimeline ? 0 : 1,
        pl: showTimeline ? 0 : 1,
      }}
    >
      <FullscreenProgressBar loading={loading} />
      {showTimeline ? (
        <TimelineView
          onClose={() => setShowTimeline(false)}
          data={summaryData}
        />
      ) : (
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
      )}

      {/* {!showTimeline && (
        <SpeedDial
          ariaLabel="Record Page Actions"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          onClose={handleSpeedDialClose}
          onOpen={handleSpeedDialOpen}
          open={openSpeedDial}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              tooltipOpen
              onClick={action.handleClick} // handleClick内でSpeedDialCloseが呼ばれる想定
            />
          ))}
        </SpeedDial>
      )} */}
    </Box>
  );
};

export default RecordsPage;
