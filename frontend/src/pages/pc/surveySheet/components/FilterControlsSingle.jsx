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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";

import { fetchTimeRecords } from "../../../../store/slices/timeRecordSlice";
import { getValue, setItem } from "../../../../utils/localStorageUtils";
import { setStaffList } from "../../../../store/slices/staffSlice";
import { isEmpty } from "../../../../utils/isEmpty";
import { apiFetch } from "../../../../utils/api";

// 選択日付・職員保存キー（surveySheet専用）
const LS_KEYS = {
  sheetSingleDate: "sheet_single_date",
  sheetSingleStaff: "sheet_single_staff",
};

const FilterControlsSingle = ({ allowAllStaff = true }) => {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedStaff, setSelectedStaff] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  const staffList = useSelector((state) => state.staff.staffList);
  const timeStudyRecord = useSelector((state) => state.timeRecord.record);

  const user = getValue("user");
  const isAdmin = user?.isAdmin;

  // ★ 起動時にローカル保存した単日を復元
  useEffect(() => {
    const saved = getValue(LS_KEYS.sheetSingleDate);
    if (saved) {
      const d = dayjs(saved);
      if (d.isValid()) {
        setSelectedDate(d);
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

    if (isAdmin && user?.officeId) {
      fetchStaffList();
    }
  }, []); // eslint-disable-line

  // ★ 起動時にローカル保存した職員選択を復元
  useEffect(() => {
    if (isAdmin) {
      // 管理者の場合：保存された職員選択を復元
      const savedStaff = getValue(LS_KEYS.sheetSingleStaff);
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
  }, [isAdmin, allowAllStaff]); // eslint-disable-line

  // ★ 全員が不許可に切り替わった場合のフォールバック
  useEffect(() => {
    if (!isAdmin) return;
    if (allowAllStaff) return;
    if (selectedStaff !== "all") return;

    if (Array.isArray(staffList) && staffList.length > 0) {
      const first = staffList[0];
      setSelectedStaff(first);
      setItem(LS_KEYS.sheetSingleStaff, first);
    } else {
      setSelectedStaff("");
    }
  }, [allowAllStaff, isAdmin, selectedStaff, staffList]);

  // 日付or職員選択でタイムスタディレコードの取得（単日）
  useEffect(() => {
    if (!user?.office?.id || !selectedStaff || !selectedDate) return;

    const dateStr = selectedDate.format("YYYY-MM-DD");
    const staffParam = selectedStaff === "all" ? "all" : selectedStaff.id;

    dispatch(
      fetchTimeRecords({
        staffId: staffParam,
        startDate: dateStr,
        endDate: dateStr,
      })
    );
  }, [dispatch, user?.office?.id, selectedStaff, selectedDate]);

  const handleStaffChange = (event) => {
    const selectedValue = event.target.value;
    // 全員が不許可の時に 'all' を選んだら弾く
    if (!allowAllStaff && selectedValue === "all") return;

    // IDから職員オブジェクトを取得
    const staffObject =
      selectedValue === "all"
        ? "all"
        : staffList.find((staff) => staff.id === selectedValue);
    setSelectedStaff(staffObject);

    // ★ 職員選択時にローカル保存
    if (staffObject) {
      setItem(LS_KEYS.sheetSingleStaff, staffObject);
    }
  };

  // ★ 日付選択時にローカル保存
  const handleDateChange = (newValue) => {
    setSelectedDate(newValue);
    if (newValue && dayjs(newValue).isValid()) {
      setItem(LS_KEYS.sheetSingleDate, dayjs(newValue).format("YYYY-MM-DD"));
    }
    setAnchorEl(null);
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
                value={selectedDate}
                format="YYYY年M月D日"
                onChange={handleDateChange}
                reduceAnimations
              />
            </Popover>
          </Box>

          {/* 職員選択 （管理者以外は自分の名前）*/}
          <Box display="flex" alignItems="center" gap={0.5}>
            <PersonOutlineIcon />
            <Typography variant="body2">職員:</Typography>
            {isAdmin ? (
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

        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={isEmpty(timeStudyRecord)}
        >
          出力
        </Button>
      </Box>
    </LocalizationProvider>
  );
};

export default FilterControlsSingle;
