import { useState, useEffect } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { alpha, styled } from "@mui/material/styles";
import DateRangeIcon from "@mui/icons-material/DateRange";
import TodayIcon from "@mui/icons-material/Today";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import dayjs from "dayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";

const StyledPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) =>
    prop !== "dayisbetween" && prop !== "dayisstart" && prop !== "dayisend",
})(({ theme, dayisbetween, dayisstart, dayisend }) => ({
  ...(dayisbetween && {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    borderRadius: 0,
  }),
  ...(dayisstart && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderTopLeftRadius: "50%",
    borderBottomLeftRadius: "50%",
  }),
  ...(dayisend && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderTopRightRadius: "50%",
    borderBottomRightRadius: "50%",
  }),
}));

const RangeDateSelector = ({
  startDate,
  endDate,
  minDate,
  maxDate,
  onChange,
  onSelectionComplete,
}) => {
  const [mode, setMode] = useState(
    startDate && endDate && !startDate.isSame(endDate, "day")
      ? "range"
      : "single"
  );
  const [pendingStart, setPendingStart] = useState(null);
  // 期間選択時の一時的な日付状態
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  // 前回選択された日付（年変更を検知するため）
  const [lastSelectedDate, setLastSelectedDate] = useState(startDate);

  // startDate/endDateが変更された時に一時的な日付も更新
  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setLastSelectedDate(startDate);
  }, [startDate, endDate]);

  const handleModeChange = (_event, nextMode) => {
    if (!nextMode) return;
    setMode(nextMode);
    if (nextMode === "single" && startDate) {
      // モード変更時はonChangeを呼ばず、内部状態だけを更新
      setPendingStart(null);
      setTempStartDate(startDate);
      setTempEndDate(startDate);
      setLastSelectedDate(startDate);
    } else {
      setPendingStart(null);
      setTempStartDate(startDate);
      setTempEndDate(endDate);
    }
  };

  const handleToday = () => {
    const today = dayjs().startOf("day");
    onChange(today, today);
    setMode("single");
    setPendingStart(null);
    setTempStartDate(today);
    setTempEndDate(today);
    setLastSelectedDate(today);
    // 「今日」ボタンを押した時は単日選択なのでカレンダーを閉じる
    if (onSelectionComplete) {
      onSelectionComplete();
    }
  };

  const handleSelectDay = (selectedDay) => {
    if (!selectedDay) return;
    const normalizedDay = selectedDay.startOf("day");

    if (mode === "single") {
      // 年だけが変わっている場合はカレンダーを閉じない
      if (
        lastSelectedDate &&
        normalizedDay.year() !== lastSelectedDate.year() &&
        normalizedDay.month() === lastSelectedDate.month() &&
        normalizedDay.date() === lastSelectedDate.date()
      ) {
        // 年だけが変わっている場合はonChangeを呼ばず、内部状態だけを更新
        setLastSelectedDate(normalizedDay);
        return;
      }

      // 日付が選択された場合は確定してカレンダーを閉じる
      onChange(normalizedDay, normalizedDay);
      setLastSelectedDate(normalizedDay);
      if (onSelectionComplete) {
        onSelectionComplete();
      }
      return;
    }

    // 期間選択時は内部状態だけを更新（onChangeは呼ばない）
    if (!pendingStart) {
      setPendingStart(normalizedDay);
      setTempStartDate(normalizedDay);
      setTempEndDate(normalizedDay);
      return;
    }

    if (normalizedDay.isBefore(pendingStart, "day")) {
      setTempStartDate(normalizedDay);
      setTempEndDate(pendingStart);
    } else {
      setTempStartDate(pendingStart);
      setTempEndDate(normalizedDay);
    }
    setPendingStart(null);
  };

  const handleOk = () => {
    // OKボタンを押した時だけonChangeを呼ぶ
    onChange(tempStartDate, tempEndDate);
    if (onSelectionComplete) {
      onSelectionComplete();
    }
  };

  const RangeHighlightDay = (DayComponentProps) => {
    const { day, outsideCurrentMonth, ...other } = DayComponentProps;
    if (outsideCurrentMonth) {
      return <PickersDay day={day} outsideCurrentMonth {...other} />;
    }
    const normalizedDay = dayjs(day);
    // 期間選択モードでは一時的な日付を表示
    const displayStart = mode === "range" ? tempStartDate : startDate;
    const displayEnd = mode === "range" ? tempEndDate : endDate;
    
    const isStart = displayStart ? normalizedDay.isSame(displayStart, "day") : false;
    const isEnd = displayEnd ? normalizedDay.isSame(displayEnd, "day") : false;
    const isBetween =
      displayStart &&
      displayEnd &&
      normalizedDay.isAfter(displayStart, "day") &&
      normalizedDay.isBefore(displayEnd, "day");
    return (
      <StyledPickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        dayisbetween={isBetween ? 1 : 0}
        dayisstart={isStart ? 1 : 0}
        dayisend={isEnd ? 1 : 0}
      />
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        height: "100%",
        p: 2,
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
          flexWrap: "wrap",
          gap: 1,
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <ToggleButtonGroup
          color="primary"
          value={mode}
          exclusive
          onChange={handleModeChange}
          size="small"
        >
          <ToggleButton value="single">
            <TodayIcon fontSize="small" />
            &nbsp;単日
          </ToggleButton>
          <ToggleButton value="range">
            <DateRangeIcon fontSize="small" />
            &nbsp;期間
          </ToggleButton>
        </ToggleButtonGroup>
        <Button onClick={handleToday} size="small" variant="outlined">
          今日
        </Button>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            width: "100%",
            maxWidth: "100%",
            "& .MuiPickersCalendarHeader-root": {
              maxWidth: "100%",
            },
            "& .MuiDayCalendar-weekContainer": {
              maxWidth: "100%",
            },
            "& .MuiPickersDay-root": {
              maxWidth: "100%",
            },
          }}
        >
          <DateCalendar
            value={mode === "range" ? (tempEndDate || tempStartDate || dayjs()) : (endDate || startDate || dayjs())}
            onChange={handleSelectDay}
            minDate={minDate}
            maxDate={maxDate}
            showDaysOutsideCurrentMonth
            onMonthChange={() => setPendingStart(null)}
            slots={{
              day: RangeHighlightDay,
            }}
            sx={{
              width: "100%",
              maxWidth: "100%",
            }}
          />
        </Box>
      </Box>

      {/* 期間選択モードの時だけOKボタンを表示 */}
      {mode === "range" && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            pt: 2,
            pb: 2,
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleOk}
            disabled={!tempStartDate || !tempEndDate}
            size="large"
            sx={{ minWidth: "120px" }}
          >
            OK
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default RangeDateSelector;

