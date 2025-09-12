import "./FilterControls.scss";

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
} from "@mui/material";
import { Stack } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";

import {
  fetchOfficeTimeRecords,
  fetchTimeRecords,
} from "../../store/slices/timeRecordSlice";
import { getValue, setItem } from "../../utils/localStorageUtils";
import { setStaffList } from "../../store/slices/staffSlice";
import { isEmpty } from "../../utils/isEmpty";
import { apiFetch } from "../../utils/api";

// 選択日付・職員保存キー
const LS_KEYS = {
  recordSingleDate: "ts_single_date",
  sheetSingleDate: "sheet_single_date",
  recordSingleStaff: "ts_single_staff",
  sheetSingleStaff: "sheet_single_staff",
};

const FilterControlsSingle = ({ allowAllStaff = true }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [draftDate, setDraftDate] = useState(dayjs());
  const [selectedStaff, setSelectedStaff] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  const staffList = useSelector((state) => state.staff.staffList);
  const timeStudyRecord = useSelector((state) => state.timeRecord.record);

  const user = getValue("user");
  const isAdmin = user?.isAdmin;

  const sheetPage = location.pathname.startsWith("/survey-sheet");

  const LS_DATE_KEY = sheetPage
    ? LS_KEYS.sheetSingleDate
    : LS_KEYS.recordSingleDate;
  const LS_STAFF_KEY = sheetPage
    ? LS_KEYS.sheetSingleStaff
    : LS_KEYS.recordSingleStaff;

  // ★ 起動時にローカル保存した単日を復元
  useEffect(() => {
    const saved = getValue(LS_DATE_KEY);
    if (saved) {
      const d = dayjs(saved);
      if (d.isValid()) {
        setSelectedDate(d);
      }
    }
  }, [LS_DATE_KEY]);

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

    if (isAdmin && user?.officeId) {
      fetchStaffList();
    }
  }, []); // eslint-disable-line

  // ★ 起動時にローカル保存した職員選択を復元
  useEffect(() => {
    if (isAdmin) {
      // 管理者の場合：保存された職員選択を復元
      const savedStaff = getValue(LS_STAFF_KEY);
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
  }, [isAdmin, LS_STAFF_KEY, allowAllStaff]); // eslint-disable-line

  // ★ 全員が不許可に切り替わった場合のフォールバック
  useEffect(() => {
    if (!isAdmin) return;
    if (allowAllStaff) return;
    if (selectedStaff !== "all") return;

    if (Array.isArray(staffList) && staffList.length > 0) {
      const first = staffList[0];
      setSelectedStaff(first);
      setItem(LS_STAFF_KEY, first);
    } else {
      setSelectedStaff("");
    }
  }, [allowAllStaff, isAdmin, selectedStaff, staffList, LS_STAFF_KEY]);

  // 日付or職員選択でタイムスタディレコードの取得（単日）
  useEffect(() => {
    if (!user?.office?.id || !selectedStaff || !selectedDate) return;

    const dateStr = selectedDate.format("YYYY-MM-DD");
    const staffParam = selectedStaff === "all" ? "all" : selectedStaff.id;

    if (sheetPage) {
      dispatch(
        fetchTimeRecords({
          staffId: staffParam,
          startDate: dateStr,
          endDate: dateStr,
        })
      );
    } else {
      dispatch(
        fetchOfficeTimeRecords({
          officeId: user.office.id,
          startDate: dateStr,
          endDate: dateStr,
          staff: staffParam,
        })
      );
    }
  }, [dispatch, user?.office?.id, selectedStaff, selectedDate]);

  const handleStaffChange = (event) => {
    const selectedValue = event.target.value;
    // 全員が不許可の時に 'all' を選んだら弾く
    if (!allowAllStaff && selectedValue === "all") return;
    setSelectedStaff(selectedValue);

    // ★ 職員選択時にローカル保存
    if (selectedValue) {
      setItem(LS_STAFF_KEY, selectedValue);
    }
  };

  // ★ 単日の確定（OK）
  const applyDate = () => {
    if (draftDate && dayjs(draftDate).isValid()) {
      setSelectedDate(draftDate);
      setItem(LS_DATE_KEY, dayjs(draftDate).format("YYYY-MM-DD"));
    }
    setAnchorEl(null);
  };

  const setToday = () => {
    const t = dayjs();
    setDraftDate(t);
  };

  // 出力 エクセル
  const handleExport = async () => {
    const recordData = await apiFetch("/export_excel", {
      method: "POST",
      responseType: "blob",
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

  const formatDate = (date) => {
    return date ? date.format("YYYY年M月D日") : "";
  };

  const handleOpen = (event) => {
    setDraftDate(selectedDate);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

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
                {formatDate(selectedDate)}
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
                value={draftDate}
                format="YYYY年M月D日"
                onChange={(v) => setDraftDate(v)}
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
                  <Button variant="contained" onClick={applyDate}>
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
            {isAdmin ? (
              <FormControl size="small" sx={{ minWidth: 190 }}>
                <Select
                  value={selectedStaff}
                  onChange={handleStaffChange}
                  sx={{ textAlign: "start", backgroundColor: "white" }}
                  className="staff-button"
                  IconComponent={ExpandMoreIcon}
                >
                  {!sheetPage && isAdmin && allowAllStaff && (
                    <MenuItem key={0} value={"all"}>
                      全員
                    </MenuItem>
                  )}
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

export default FilterControlsSingle;
