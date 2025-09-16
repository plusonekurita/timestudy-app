import {
  CalendarToday as CalendarTodayIcon,
  PersonOutline as PersonOutlineIcon,
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
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";

import { fetchOfficeTimeRecords } from "../../store/slices/timeRecordSlice";
import { getValue, setItem } from "../../utils/localStorageUtils";
import { setStaffList } from "../../store/slices/staffSlice";
import { apiFetch } from "../../utils/api";

// 選択日付・職員保存キー
const LS_KEYS = {
  rangeStart: "ts_range_start",
  rangeEnd: "ts_range_end",
  recordSingleStaff: "ts_single_staff",
};

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

const FilterControlsRange = ({ allowAllStaff = true }) => {
  const dispatch = useDispatch();

  const [selectedRange, setSelectedRange] = useState([dayjs(), dayjs()]); // [start, end]
  const [draftRange, setDraftRange] = useState([dayjs(), dayjs()]); // ダイアログ内の編集中
  const [selectedStaff, setSelectedStaff] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  const staffList = useSelector((state) => state.staff.staffList);

  const user = getValue("user");

  // ★ 起動時にローカル保存した範囲を復元
  useEffect(() => {
    const s = getValue(LS_KEYS.rangeStart);
    const e = getValue(LS_KEYS.rangeEnd);
    if (s && e) {
      const sd = dayjs(s);
      const ed = dayjs(e);
      if (sd.isValid() && ed.isValid()) {
        setSelectedRange([sd, ed]);
        setDraftRange([sd, ed]);
      }
    }
  }, []);

  // 管理者のみ職員リスト一覧の取得
  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        if (!staffList || staffList.length === 0) {
          const res = await apiFetch(`/offices/${user.officeId}/staffs`);
          dispatch(setStaffList(res));
        }
      } catch (error) {
        console.warn("職員一覧の取得に失敗しました", error);
      }
    };

    if (user?.isAdmin && user?.officeId) {
      fetchStaffList();
    }
  }, []); // eslint-disable-line

  // ★ 起動時にローカル保存した職員選択を復元
  useEffect(() => {
    if (user?.isAdmin) {
      // 管理者の場合：保存された職員選択を復元
      const savedStaff = getValue(LS_KEYS.recordSingleStaff);
      if (savedStaff) {
        if (!allowAllStaff && savedStaff === "all") {
          // 全員が不許可なら反映しない
          setSelectedStaff("");
        } else {
          setSelectedStaff(savedStaff);
        }
      }
    } else if (user) {
      // 一般ユーザーの場合：自分の情報を設定
      setSelectedStaff(user);
    }
  }, [user?.isAdmin, allowAllStaff]); // eslint-disable-line

  // ★ 全員が不許可に切り替わった場合のフォールバック
  useEffect(() => {
    if (!user?.isAdmin) return;
    if (allowAllStaff) return;
    if (selectedStaff !== "all") return;

    if (Array.isArray(staffList) && staffList.length > 0) {
      const first = staffList[0];
      setSelectedStaff(first);
      setItem(LS_KEYS.recordSingleStaff, first);
    } else {
      setSelectedStaff("");
    }
  }, [allowAllStaff, user?.isAdmin, selectedStaff, staffList]);

  // 日付範囲 or 職員選択でレコード取得
  useEffect(() => {
    const [start, end] = selectedRange || [];
    if (!user?.office?.id || !selectedStaff || !start || !end) return;

    const startStr = start.format("YYYY-MM-DD");
    const endStr = end.format("YYYY-MM-DD");
    const staffParam = selectedStaff === "all" ? "all" : selectedStaff.id;

    dispatch(
      fetchOfficeTimeRecords({
        officeId: user.office.id,
        startDate: startStr,
        endDate: endStr,
        staff: staffParam,
      })
    );
  }, [dispatch, user?.office?.id, selectedStaff, selectedRange]);

  const handleStaffChange = (event) => {
    const selectedValue = event.target.value;
    if (!allowAllStaff && selectedValue === "all") return; // 全員禁止時は弾く

    // IDから職員オブジェクトを取得
    const staffObject =
      selectedValue === "all"
        ? "all"
        : staffList.find((staff) => staff.id === selectedValue);
    setSelectedStaff(staffObject);

    // ★ 職員選択時にローカル保存
    if (staffObject) {
      setItem(LS_KEYS.recordSingleStaff, staffObject);
    }
  };

  /* ---------- 日付ポップオーバー ---------- */
  const handleOpen = (event) => {
    setDraftRange(selectedRange);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

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
    // ★ 範囲をローカル保存
    if (draftRange[0] && draftRange[1]) {
      setItem(LS_KEYS.rangeStart, draftRange[0].format("YYYY-MM-DD"));
      setItem(LS_KEYS.rangeEnd, draftRange[1].format("YYYY-MM-DD"));
    }
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
                value={null}
                onChange={handleDaySelect}
                slots={{ day: RangeDay }}
                slotProps={{
                  day: {
                    start: draftRange[0],
                    end: draftRange[1],
                  },
                }}
                referenceDate={draftRange[0] ?? dayjs()}
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
                  value={
                    selectedStaff === "all" ? "all" : selectedStaff?.id || ""
                  }
                  onChange={handleStaffChange}
                  sx={{ textAlign: "start", backgroundColor: "white" }}
                  className="staff-button"
                  IconComponent={ExpandMoreIcon}
                >
                  {allowAllStaff && (
                    <MenuItem key={0} value={"all"}>
                      全員
                    </MenuItem>
                  )}
                  {staffList.map((staff) => (
                    <MenuItem key={staff.id} value={staff.id}>
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
      </Box>
    </LocalizationProvider>
  );
};

export default FilterControlsRange;
