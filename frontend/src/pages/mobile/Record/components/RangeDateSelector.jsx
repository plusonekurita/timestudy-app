import { useMemo, useState } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
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

const formatLabel = (date) =>
  date ? date.format("YYYY年M月D日(ddd)") : "未選択";

const RangeDateSelector = ({
  startDate,
  endDate,
  minDate,
  maxDate,
  onChange,
}) => {
  const [mode, setMode] = useState(
    startDate && endDate && !startDate.isSame(endDate, "day")
      ? "range"
      : "single"
  );
  const [pendingStart, setPendingStart] = useState(null);

  const handleModeChange = (_event, nextMode) => {
    if (!nextMode) return;
    setMode(nextMode);
    if (nextMode === "single" && startDate) {
      onChange(startDate, startDate);
      setPendingStart(null);
    } else {
      setPendingStart(null);
    }
  };

  const handleToday = () => {
    const today = dayjs().startOf("day");
    onChange(today, today);
    setMode("single");
    setPendingStart(null);
  };

  const handleSelectDay = (selectedDay) => {
    if (!selectedDay) return;
    const normalizedDay = selectedDay.startOf("day");

    if (mode === "single") {
      onChange(normalizedDay, normalizedDay);
      return;
    }

    if (!pendingStart) {
      setPendingStart(normalizedDay);
      onChange(normalizedDay, normalizedDay);
      return;
    }

    if (normalizedDay.isBefore(pendingStart, "day")) {
      onChange(normalizedDay, pendingStart);
    } else {
      onChange(pendingStart, normalizedDay);
    }
    setPendingStart(null);
  };

  const summaryText = useMemo(() => {
    if (!startDate || !endDate) {
      return "日付を選択してください";
    }
    if (startDate.isSame(endDate, "day")) {
      return formatLabel(startDate);
    }
    const days = endDate.diff(startDate, "day") + 1;
    return `${formatLabel(startDate)} 〜 ${formatLabel(
      endDate
    )}（${days}日分）`;
  }, [startDate, endDate]);

  const RangeHighlightDay = (DayComponentProps) => {
    const { day, outsideCurrentMonth, ...other } = DayComponentProps;
    if (outsideCurrentMonth) {
      return <PickersDay day={day} outsideCurrentMonth {...other} />;
    }
    const normalizedDay = dayjs(day);
    const isStart = startDate ? normalizedDay.isSame(startDate, "day") : false;
    const isEnd = endDate ? normalizedDay.isSame(endDate, "day") : false;
    const isBetween =
      startDate &&
      endDate &&
      normalizedDay.isAfter(startDate, "day") &&
      normalizedDay.isBefore(endDate, "day");
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
        p: 2,
        borderRadius: 3,
        mb: 2,
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

      <Typography variant="subtitle2" color="text.secondary">
        選択中
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
        {summaryText}
      </Typography>

      <DateCalendar
        value={endDate || startDate || dayjs()}
        onChange={handleSelectDay}
        minDate={minDate}
        maxDate={maxDate}
        showDaysOutsideCurrentMonth
        onMonthChange={() => setPendingStart(null)}
        slots={{
          day: RangeHighlightDay,
        }}
      />
    </Paper>
  );
};

export default RangeDateSelector;

