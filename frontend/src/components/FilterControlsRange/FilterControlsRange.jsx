import {
  CalendarToday as CalendarTodayIcon,
  PersonOutline as PersonOutlineIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Typography,
  Button,
  Popover,
  Paper,
  Stack,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";

import {
  fetchTimeRecords,
  fetchOfficeTimeRecords,
} from "../../store/slices/timeRecordSlice";
import { setStaffList } from "../../store/slices/staffSlice";
import { getValue } from "../../utils/localStorageUtils";
import { isEmpty } from "../../utils/isEmpty";
import { apiFetch } from "../../utils/api";

const RangePickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) =>
    prop !== "isHighlighting" && prop !== "isStart" && prop !== "isEnd",
})(({ theme, isHighlighting, isStart, isEnd }) => ({
  ...(isHighlighting && {
    borderRadius: 0,
    backgroundColor: theme.palette.action.hover,
  }),
  ...(isStart && {
    borderTopLeftRadius: theme.shape.borderRadius,
    borderBottomLeftRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover": { backgroundColor: theme.palette.primary.dark },
  }),
  ...(isEnd && {
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover": { backgroundColor: theme.palette.primary.dark },
  }),
}));

function RangeDay(props) {
  const { day, outsideCurrentMonth, start, end, ...other } = props;
  const isStart = !!(start && day.isSame(start, "day"));
  const isEnd = !!(end && day.isSame(end, "day"));
  // 中間日のハイライト（端は除く）
  const isMid =
    !!start && !!end && day.isAfter(start, "day") && day.isBefore(end, "day");

  return (
    <RangePickersDay
      {...other}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      selected={isStart || isEnd}
      isStart={isStart}
      isEnd={isEnd}
      isHighlighting={isMid}
    />
  );
}

const FilterControlsRange = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const [selectedRange, setSelectedRange] = useState([dayjs(), dayjs()]); // [start, end]
  const [draftRange, setDraftRange] = useState([dayjs(), dayjs()]); // ダイアログ内の編集中
  const [selectedStaff, setSelectedStaff] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  const staffList = useSelector((state) => state.staff.staffList);
  const timeStudyRecord = useSelector((state) => state.timeRecord.record);

  const user = getValue("user");

  const sheetPage = location.pathname.startsWith("/survey-sheet");

  // 管理者のみ職員リスト一覧の取得
  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        if (!staffList || staffList.length === 0) {
          const res = await apiFetch(`/offices/${user.officeId}/staffs`);
          console.log(res);
          dispatch(setStaffList(res));
        }
      } catch (error) {
        console.warn("職員一覧の取得に失敗しました", error);
      }
    };

    if (user?.isAdmin && user?.officeId) {
      fetchStaffList();
    }
  }, []);

  useEffect(() => {
    if (!user.isAdmin) {
      setSelectedStaff(user);
    }
  }, []);

  // 日付範囲 or 職員選択でレコード取得
  useEffect(() => {
    const [start, end] = selectedRange || [];
    if (selectedStaff && start && end) {
      const startStr = start.format("YYYY-MM-DD");
      const endStr = end.format("YYYY-MM-DD");
      if (selectedStaff === "all") {
        dispatch(
          fetchOfficeTimeRecords({
            officeId: user.office.id,
            startDate: startStr,
            endDate: endStr,
            // staffIds: 職員を絞り込みたいとき（未実装）
            includeEmptyStaff: true, // 記録がない職員も取得
          })
        );
      } else {
        dispatch(
          fetchTimeRecords({
            staffId: selectedStaff.id,
            startDate: startStr,
            endDate: endStr,
          })
        );
      }
    }
  }, [selectedStaff, selectedRange]);

  const handleStaffChange = (event) => {
    setSelectedStaff(event.target.value);
  };

  // 出力 エクセル
  const handleExport = async () => {
    const recordData = await apiFetch("/export_excel", {
      method: "POST",
      responseType: "blob", // excel
      body: {
        staff: user,
        record_date: timeStudyRecord[0].record_date,
        record: timeStudyRecord[0].record,
      },
    });

    const blob = await recordData;
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "タイムスタディ出力.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  /* ---------- 日付ポップオーバー ---------- */
  const handleOpen = (event) => {
    setDraftRange(selectedRange);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  // 1回目クリックで開始、2回目で終了（前後自動入れ替え）
  const handleDaySelect = (day) => {
    const [s, e] = draftRange;
    if (!s || (s && e)) {
      setDraftRange([day, null]);
      return;
    }
    if (day.isBefore(s, "day")) {
      setDraftRange([day, s]);
    } else {
      setDraftRange([s, day]);
    }
  };

  const applyRange = () => {
    setSelectedRange(draftRange);
    handleClose();
  };

  const setToday = () => {
    const t = dayjs();
    setDraftRange([t, t]);
  };
  /* ---------------------------------------- */

  const formatRangeJa = (range) => {
    const [s, e] = range || [];
    if (s && e) {
      return `${s.format("YYYY年M月D日")}～${e.format("YYYY年M月D日")}`;
    }
    if (s && !e) return `${s.format("YYYY年M月D日")}～`;
    return "範囲を選択";
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      className="filter"
      adapterLocale="ja"
    >
      <Box display="flex" justifyContent="space-between">
        <Box display="flex">
          {/* 日付選択 */}
          <Box display="flex" alignItems="center" gap={0.5} sx={{ mr: 3 }}>
            <CalendarTodayIcon />
            <Typography variant="body2">日付:</Typography>
            <Paper elevation={1}>
              <Button
                variant="outlined"
                onClick={handleOpen}
                className="date-button"
              >
                {formatRangeJa(selectedRange)}
                <ExpandMoreIcon />
              </Button>
            </Paper>

            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <DateCalendar
                value={null} // 単一日 pick（範囲は自前）
                onChange={handleDaySelect}
                slots={{ day: RangeDay }}
                slotProps={{
                  day: {
                    start: draftRange[0],
                    end: draftRange[1],
                  },
                }}
                referenceDate={draftRange[0] ?? dayjs()} // 本日 or 開始日にカレンダーを寄せる
                reduceAnimations
              />

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mt: 1 }}
              >
                <Button size="small" onClick={setToday}>
                  本日
                </Button>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button color="inherit" onClick={handleClose}>
                    戻る
                  </Button>
                  <Button
                    variant="contained"
                    onClick={applyRange}
                    disabled={!draftRange[0] || !draftRange[1]}
                  >
                    OK
                  </Button>
                </Stack>
              </Stack>
            </Popover>
          </Box>

          {/* 職員選択 （管理者以外は自分の名前）*/}
          <Box display="flex" alignItems="center" gap={0.5}>
            <PersonOutlineIcon />
            <Typography variant="body2">職員:</Typography>
            {user?.isAdmin ? (
              <FormControl size="small" sx={{ minWidth: 190 }}>
                <Select
                  value={selectedStaff}
                  onChange={handleStaffChange}
                  sx={{ textAlign: "start" }}
                  className="staff-button"
                  IconComponent={ExpandMoreIcon}
                >
                  <MenuItem key={0} value={"all"}>
                    全員
                  </MenuItem>
                  {staffList.map((staff) => (
                    <MenuItem key={staff.id} value={staff}>
                      {staff.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Typography variant="body2">{user?.userName}</Typography>
            )}
          </Box>
        </Box>

        {sheetPage && (
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={isEmpty(timeStudyRecord)}
          >
            出力
          </Button>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default FilterControlsRange;
