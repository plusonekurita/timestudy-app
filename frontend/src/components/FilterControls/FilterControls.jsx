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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import { useFetcher } from "react-router-dom";
import dayjs from "dayjs";

import { fetchTimeRecords } from "../../store/slices/timeRecordSlice";
import { setStaffList } from "../../store/slices/staffSlice";
import { getValue } from "../../utils/localStorageUtils";
import { isEmpty } from "../../utils/isEmpty";
import { apiFetch } from "../../utils/api";

const FilterControls = () => {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedStaff, setSelectedStaff] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  const staffList = useSelector((state) => state.staff.staffList);
  const timeStudyRecord = useSelector((state) => state.timeRecord.record);

  const user = getValue("user");

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

  // 日付or職員選択でタイムスタディレコードの取得
  useEffect(() => {
    if (selectedStaff && selectedDate) {
      const dateStr = selectedDate.format("YYYY-MM-DD");

      console.log(selectedStaff);

      dispatch(
        fetchTimeRecords({
          staffId: selectedStaff.id,
          startDate: dateStr,
          endDate: dateStr,
        })
      );
    }
  }, [selectedStaff, selectedDate]);

  const handleStaffChange = (event) => {
    setSelectedStaff(event.target.value);
  };
  const handleDateChange = (newValue) => {
    setSelectedDate(newValue);
    setAnchorEl(null);
  };

  // 出力 エクセル
  const handleExport = async () => {
    const recordData = await apiFetch("/export_excel", {
      method: "POST",
      responseType: "blob", // excel
      body: {
        staff: user,
        record_date: timeStudyRecord.record_date,
        record: timeStudyRecord.record,
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
              />
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

export default FilterControls;
