import "dayjs/locale/ja";
import {
  Box,
  Typography,
  Button,
  Paper,
  Popover,
  Grid,
  IconButton,
  Card,
  CardContent,
  Divider,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DownloadIcon from "@mui/icons-material/Download";
import ClearIcon from "@mui/icons-material/Clear";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";

import PageSectionLayout from "../../../components/PageSectionLayout/PageSectionLayout";
import { fetchOfficeTimeRecords } from "../../../store/slices/timeRecordSlice";
import { getValue } from "../../../utils/localStorageUtils";
import { apiFetch } from "../../../utils/api";
import { menuCategories } from "../../../constants/menu";
import { colors } from "../../../constants/theme";

const CreateReport = () => {
  const dispatch = useDispatch();
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [tempSelectedDates, setTempSelectedDates] = useState([]);
  const hasSelectedDates = selectedDates.length > 0;

  const user = getValue("user");
  const officeId = user?.office?.id;
  const loading = useSelector((state) => state.timeRecord.loading);
  const officeRecords = useSelector((state) => state.timeRecord.officeRecords);

  // 選択した月の日付一覧を生成
  const monthDates = useMemo(() => {
    if (!selectedMonth) return [];
    const start = selectedMonth.startOf("month");
    const end = selectedMonth.endOf("month");
    const dates = [];
    let current = start;
    while (current.isBefore(end) || current.isSame(end, "day")) {
      dates.push(current);
      current = current.add(1, "day");
    }
    return dates;
  }, [selectedMonth]);

  // 記録がある日付のセットを生成
  const datesWithRecords = useMemo(() => {
    if (!officeRecords || officeRecords.length === 0) return new Set();
    const dateSet = new Set();
    officeRecords.forEach((record) => {
      if (record.record_date) {
        // record_dateが文字列の場合はそのまま、Dateオブジェクトの場合はフォーマット
        const dateStr =
          typeof record.record_date === "string"
            ? record.record_date
            : dayjs(record.record_date).format("YYYY-MM-DD");
        dateSet.add(dateStr);
      }
    });
    return dateSet;
  }, [officeRecords]);

  // 記録がある日付の数をカウント
  const uniqueDatesCount = useMemo(() => {
    return datesWithRecords.size;
  }, [datesWithRecords]);

  // 選択した日付の記録のみを抽出
  const filteredRecords = useMemo(() => {
    if (
      !officeRecords ||
      officeRecords.length === 0 ||
      selectedDates.length === 0
    ) {
      return [];
    }

    const selectedDateStrings = new Set(
      selectedDates.map((d) => d.format("YYYY-MM-DD"))
    );

    return officeRecords.filter((record) => {
      if (!record.record_date) return false;
      const dateStr =
        typeof record.record_date === "string"
          ? record.record_date
          : dayjs(record.record_date).format("YYYY-MM-DD");
      return selectedDateStrings.has(dateStr);
    });
  }, [officeRecords, selectedDates]);

  // 月が変更されたときに日付選択をリセットし、その月の全期間で記録を取得
  useEffect(() => {
    setSelectedDates([]);

    // 月が変更されたら、その月の全期間で記録を取得
    if (!officeId || !selectedMonth) return;

    const startDate = selectedMonth.startOf("month").format("YYYY-MM-DD");
    const endDate = selectedMonth.endOf("month").format("YYYY-MM-DD");

    dispatch(
      fetchOfficeTimeRecords({
        officeId,
        startDate,
        endDate,
        staff: "all",
      })
    );
  }, [dispatch, officeId, selectedMonth]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // 日付選択ダイアログを開く
  const handleOpenDateDialog = () => {
    // ダイアログを開くときに現在の選択状態を一時状態にコピー
    setTempSelectedDates([...selectedDates]);
    setDateDialogOpen(true);
  };

  // 日付選択ダイアログを閉じる
  const handleCloseDateDialog = () => {
    setDateDialogOpen(false);
    // キャンセル時は一時状態をリセット
    setTempSelectedDates([]);
  };

  // 日付の選択/解除（一時状態を更新）
  const handleDateToggle = (date) => {
    const dateStr = date.format("YYYY-MM-DD");
    setTempSelectedDates((prev) => {
      if (prev.some((d) => d.format("YYYY-MM-DD") === dateStr)) {
        // 既に選択されている場合は解除
        return prev.filter((d) => d.format("YYYY-MM-DD") !== dateStr);
      } else {
        // 最大5日まで選択可能
        if (prev.length >= 5) {
          return prev;
        }
        return [...prev, date];
      }
    });
  };

  // OKボタンで記録を取得
  const handleDateSelectOk = () => {
    if (tempSelectedDates.length === 0) {
      alert("日付を選択してください");
      return;
    }

    // 選択を確定
    setSelectedDates([...tempSelectedDates]);

    handleCloseDateDialog();
  };

  // 選択中の日付を解除
  const handleClearSelectedDates = () => {
    setSelectedDates([]);
  };

  const handleMonthSelect = (month) => {
    const newDate = dayjs().year(currentYear).month(month);
    setSelectedMonth(newDate);
    handleClose();
  };

  const handleYearChange = (delta) => {
    setCurrentYear((prev) => prev + delta);
  };

  const formatMonth = (date) => {
    return date ? date.format("YYYY年M月") : "";
  };

  // 日勤/夜勤を分類する関数
  const classifyShift = useCallback((record) => {
    if (!record || !Array.isArray(record.record)) {
      return "day"; // デフォルトは日勤
    }

    // 23時～5時の記録の合計時間（分）を計算
    let nightShiftMinutes = 0;

    record.record.forEach((item) => {
      if (!item.startTime || !item.endTime) return;

      const start = dayjs(item.startTime);
      const end = dayjs(item.endTime);

      // 記録の開始時刻と終了時刻を取得
      const startHour = start.hour();
      const startMinute = start.minute();
      const endHour = end.hour();
      const endMinute = end.minute();

      // 23時～5時の範囲をチェック（23:00～05:59）
      const isNightHour = (hour) => {
        return hour >= 23 || hour <= 5;
      };

      // 記録が夜間時間帯に含まれるかチェック
      if (isNightHour(startHour) || isNightHour(endHour)) {
        let nightMinutes = 0;

        // 記録が完全に夜間時間帯内の場合
        if (isNightHour(startHour) && isNightHour(endHour)) {
          // 同じ時間帯内（例：23:30～23:45）
          if (startHour === endHour) {
            nightMinutes = endMinute - startMinute;
          } else {
            // 日をまたぐ場合（例：23:30～01:30）
            if (startHour > endHour) {
              // 23時台から始まって翌日の5時台まで
              // 23時台の残り時間 + 0時～5時台の時間
              if (startHour === 23) {
                nightMinutes = 60 - startMinute + (endHour * 60 + endMinute);
              } else {
                // 0時～5時台から始まって5時台まで
                nightMinutes =
                  endHour * 60 + endMinute - (startHour * 60 + startMinute);
              }
            } else {
              // 同じ日の23時～5時の範囲内（通常は発生しないが念のため）
              nightMinutes = end.diff(start, "minute");
            }
          }
        } else if (isNightHour(startHour)) {
          // 開始時刻が夜間時間帯内
          if (startHour >= 23) {
            // 23時台から始まる場合、記録の終了時刻まで（最大5時59分まで）
            const nightEnd = isNightHour(endHour)
              ? endHour * 60 + endMinute
              : 6 * 60 - 1; // 5時59分
            nightMinutes = nightEnd - (startHour * 60 + startMinute);
          } else {
            // 0時～5時台から始まる場合、5時59分まで
            const nightEnd = isNightHour(endHour)
              ? endHour * 60 + endMinute
              : 6 * 60 - 1; // 5時59分
            nightMinutes = nightEnd - (startHour * 60 + startMinute);
          }
          // 実際の記録時間を超えないようにする
          const totalDuration = end.diff(start, "minute");
          nightMinutes = Math.min(nightMinutes, totalDuration);
        } else if (isNightHour(endHour)) {
          // 終了時刻が夜間時間帯内
          if (endHour >= 23) {
            // 23時台で終わる場合、23時00分から終了時刻まで
            nightMinutes = endHour * 60 + endMinute - 23 * 60;
          } else {
            // 0時～5時台で終わる場合、23時00分から終了時刻まで
            nightMinutes = 23 * 60 + (endHour * 60 + endMinute);
          }
          // 実際の記録時間を超えないようにする
          const totalDuration = end.diff(start, "minute");
          nightMinutes = Math.min(nightMinutes, totalDuration);
        }

        nightShiftMinutes += nightMinutes;
      }
    });

    // 2時間（120分）以上あれば夜勤
    return nightShiftMinutes >= 120 ? "night" : "day";
  }, []);

  // 記録を日勤と夜勤に分類
  const { dayShiftRecords, nightShiftRecords } = useMemo(() => {
    if (!filteredRecords || filteredRecords.length === 0) {
      return { dayShiftRecords: [], nightShiftRecords: [] };
    }

    const dayRecords = [];
    const nightRecords = [];

    filteredRecords.forEach((record) => {
      const shiftType = classifyShift(record);
      if (shiftType === "night") {
        nightRecords.push(record);
      } else {
        dayRecords.push(record);
      }
    });

    return {
      dayShiftRecords: dayRecords,
      nightShiftRecords: nightRecords,
    };
  }, [filteredRecords, classifyShift]);

  // 余裕時間（bufferTime）の表示情報
  const bufferItemMeta = useMemo(() => {
    for (const category of menuCategories) {
      if (!category?.items) continue;
      const item = category.items.find((it) => it.name === "bufferTime");
      if (item) {
        return {
          label: item.label || "余裕時間",
          color: item.color || "#4DD0E1",
        };
      }
    }
    return { label: "余裕時間", color: "#4DD0E1" };
  }, []);

  // 業務タイプ別の割合を計算する関数
  const calculateTypePercentages = useCallback(
    (records) => {
      const typeMinutes = {
        directCare: 0,
        indirectWork: 0,
        other: 0,
        bufferTime: 0,
      };

      records.forEach((record) => {
        if (!Array.isArray(record.record)) return;

        record.record.forEach((item) => {
          const duration = item.duration || 0;
          const minutes = duration / 60; // 秒を分に変換

          // breakをotherに統合
          const type = item.type === "break" ? "other" : item.type;
          const isBufferTime = item.name === "bufferTime";

          if (isBufferTime) {
            typeMinutes.bufferTime += minutes;
          } else if (typeMinutes[type] !== undefined) {
            typeMinutes[type] += minutes;
          } else {
            typeMinutes.other += minutes;
          }
        });
      });

      const totalMinutes = Object.values(typeMinutes).reduce(
        (sum, val) => sum + val,
        0
      );

      const TYPE_KEYS = ["directCare", "indirectWork", "bufferTime", "other"];
      const entries = TYPE_KEYS.map((key) => {
        const category =
          key === "bufferTime"
            ? null
            : menuCategories.find((c) => c.type === key);
        const percentage =
          totalMinutes > 0 ? (typeMinutes[key] / totalMinutes) * 100 : 0;
        return {
          key,
          label:
            key === "bufferTime"
              ? bufferItemMeta.label
              : category?.label || key,
          color:
            key === "bufferTime"
              ? bufferItemMeta.color
              : category?.color || colors[key] || "#8884d8",
          percentageRaw: percentage,
          minutes: parseFloat(typeMinutes[key].toFixed(1)),
        };
      });

      // 記録が全くない場合は全て0%のまま返す
      if (totalMinutes === 0) {
        return entries.map((item) => ({
          ...item,
          percentage: 0,
        }));
      }

      let sumRounded = 0;
      const roundedEntries = entries.map((item) => {
        const rounded = parseFloat(item.percentageRaw.toFixed(1));
        sumRounded += rounded;
        return { ...item, percentage: rounded };
      });

      const diff = parseFloat((100 - sumRounded).toFixed(1));
      if (Math.abs(diff) > 0.05) {
        const lastIndex = roundedEntries.length - 1;
        roundedEntries[lastIndex].percentage = parseFloat(
          (roundedEntries[lastIndex].percentage + diff).toFixed(1)
        );
      }

      return roundedEntries;
    },
    [bufferItemMeta]
  );

  // 日中・夜間の業務タイプ別割合
  const dayShiftPercentages = useMemo(
    () => calculateTypePercentages(dayShiftRecords),
    [dayShiftRecords, calculateTypePercentages]
  );
  const nightShiftPercentages = useMemo(
    () => calculateTypePercentages(nightShiftRecords),
    [nightShiftRecords, calculateTypePercentages]
  );

  // 計測スタッフ数を計算
  const dayShiftStaffCount = useMemo(() => {
    const staffIds = new Set();
    dayShiftRecords.forEach((record) => {
      if (record.staff_id) {
        staffIds.add(record.staff_id);
      }
    });
    return staffIds.size;
  }, [dayShiftRecords]);

  const nightShiftStaffCount = useMemo(() => {
    const staffIds = new Set();
    nightShiftRecords.forEach((record) => {
      if (record.staff_id) {
        staffIds.add(record.staff_id);
      }
    });
    return staffIds.size;
  }, [nightShiftRecords]);

  // 合計計測時間を計算（時間単位、小数点第1位）
  const dayShiftTotalHours = useMemo(() => {
    let totalSeconds = 0;
    dayShiftRecords.forEach((record) => {
      if (Array.isArray(record.record)) {
        record.record.forEach((item) => {
          totalSeconds += item.duration || 0;
        });
      }
    });
    return (totalSeconds / 3600).toFixed(1); // 秒を時間に変換
  }, [dayShiftRecords]);

  const nightShiftTotalHours = useMemo(() => {
    let totalSeconds = 0;
    nightShiftRecords.forEach((record) => {
      if (Array.isArray(record.record)) {
        record.record.forEach((item) => {
          totalSeconds += item.duration || 0;
        });
      }
    });
    return (totalSeconds / 3600).toFixed(1); // 秒を時間に変換
  }, [nightShiftRecords]);

  // 選択した5日分の日中・夜間の業務タイプ別割合とスタッフ数を計算
  const {
    selectedShiftPercentages,
    selectedShiftStaffCounts,
    selectedShiftTotalHours,
  } = useMemo(() => {
    if (!hasSelectedDates) {
      return {
        selectedShiftPercentages: {
          day: { directCare: 0, indirectWork: 0, bufferTime: 0, other: 0 },
          night: { directCare: 0, indirectWork: 0, bufferTime: 0, other: 0 },
        },
        selectedShiftStaffCounts: { day: 0, night: 0 },
        selectedShiftTotalHours: { day: 0, night: 0 },
      };
    }

    const getPercentage = (percentages, key) => {
      const entry = percentages.find((p) => p.key === key);
      return entry ? entry.percentage : 0;
    };

    return {
      selectedShiftPercentages: {
        day: {
          directCare: getPercentage(dayShiftPercentages, "directCare"),
          indirectWork: getPercentage(dayShiftPercentages, "indirectWork"),
          bufferTime: getPercentage(dayShiftPercentages, "bufferTime"),
          other: getPercentage(dayShiftPercentages, "other"),
        },
        night: {
          directCare: getPercentage(nightShiftPercentages, "directCare"),
          indirectWork: getPercentage(nightShiftPercentages, "indirectWork"),
          bufferTime: getPercentage(nightShiftPercentages, "bufferTime"),
          other: getPercentage(nightShiftPercentages, "other"),
        },
      },
      selectedShiftStaffCounts: {
        day: dayShiftStaffCount,
        night: nightShiftStaffCount,
      },
      selectedShiftTotalHours: {
        day: parseFloat(dayShiftTotalHours) || 0,
        night: parseFloat(nightShiftTotalHours) || 0,
      },
    };
  }, [
    hasSelectedDates,
    dayShiftPercentages,
    nightShiftPercentages,
    dayShiftStaffCount,
    nightShiftStaffCount,
    dayShiftTotalHours,
    nightShiftTotalHours,
  ]);

  // Excelテンプレートダウンロード
  const handleDownloadTemplate = async () => {
    try {
      // 選択されている年月を取得
      const year = selectedMonth.year();
      const month = selectedMonth.month() + 1; // dayjsのmonth()は0-11なので+1

      // 選択した5日分の日中・夜間の業務タイプ別割合を取得
      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
        dayDirectCare: selectedShiftPercentages.day.directCare.toString(),
        dayIndirectWork: selectedShiftPercentages.day.indirectWork.toString(),
        dayBufferTime: selectedShiftPercentages.day.bufferTime.toString(),
        dayOther: selectedShiftPercentages.day.other.toString(),
        nightDirectCare: selectedShiftPercentages.night.directCare.toString(),
        nightIndirectWork:
          selectedShiftPercentages.night.indirectWork.toString(),
        nightBufferTime: selectedShiftPercentages.night.bufferTime.toString(),
        nightOther: selectedShiftPercentages.night.other.toString(),
        dayStaffCount: selectedShiftStaffCounts.day.toString(),
        nightStaffCount: selectedShiftStaffCounts.night.toString(),
        dayTotalHours: selectedShiftTotalHours.day.toString(),
        nightTotalHours: selectedShiftTotalHours.night.toString(),
      });

      const blob = await apiFetch(
        `/download-report-template?${params.toString()}`,
        {
          method: "GET",
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "report_template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("テンプレートのダウンロードに失敗しました:", error);
      alert("テンプレートのダウンロードに失敗しました");
    }
  };

  const months = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ];

  const isSelectedMonth = (monthIndex) => {
    return (
      selectedMonth.year() === currentYear &&
      selectedMonth.month() === monthIndex
    );
  };

  const open = Boolean(anchorEl);

  return (
    <PageSectionLayout>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* ヘッダー部分：左上に月選択ボタン、右端にエクセル出力ボタン */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarMonthIcon />
                <Paper elevation={1}>
                  <Button
                    variant="outlined"
                    onClick={handleOpen}
                    sx={{
                      minWidth: "150px",
                      justifyContent: "space-between",
                    }}
                  >
                    {formatMonth(selectedMonth)}
                    <ExpandMoreIcon />
                  </Button>
                </Paper>
              </Box>
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                {loading
                  ? "読み込み中..."
                  : uniqueDatesCount > 0
                  ? `${uniqueDatesCount}日分の記録があります`
                  : "記録なし"}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
              disabled={selectedDates.length !== 5}
            >
              EXCEL出力
            </Button>
          </Box>

          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            PaperProps={{
              sx: {
                p: 2,
                minWidth: "280px",
              },
            }}
          >
            {/* 年選択ヘッダー */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <IconButton
                size="small"
                onClick={() => handleYearChange(-1)}
                sx={{ p: 0.5 }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {currentYear}年
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleYearChange(1)}
                sx={{ p: 0.5 }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* 月グリッド */}
            <Grid container spacing={1}>
              {months.map((month, index) => (
                <Grid item xs={3} key={index}>
                  <Button
                    fullWidth
                    variant={isSelectedMonth(index) ? "contained" : "outlined"}
                    onClick={() => handleMonthSelect(index)}
                    sx={{
                      minWidth: "60px",
                      py: 1,
                      fontSize: "0.875rem",
                      fontWeight: isSelectedMonth(index) ? 600 : 400,
                    }}
                  >
                    {month}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Popover>

          {/* 日付選択ボタン */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleOpenDateDialog}
              sx={{ minWidth: "200px" }}
            >
              日付を選択 ({selectedDates.length}/5)
            </Button>
            {selectedDates.length > 0 && (
              <>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  選択中:{" "}
                  {selectedDates
                    .sort((a, b) => a - b)
                    .map((d) => d.format("M/D"))
                    .join(", ")}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleClearSelectedDates}
                  sx={{ ml: 1 }}
                >
                  選択解除
                </Button>
              </>
            )}
          </Box>

          {/* 日付選択ダイアログ */}
          <Dialog
            open={dateDialogOpen}
            onClose={handleCloseDateDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {formatMonth(selectedMonth)}の日付を選択（最大5日まで）
            </DialogTitle>
            <DialogContent>
              {/* 曜日ヘッダー */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 1,
                  mb: 1,
                  mt: 2,
                }}
              >
                {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                  <Typography
                    key={day}
                    variant="caption"
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      color: "text.secondary",
                    }}
                  >
                    {day}
                  </Typography>
                ))}
              </Box>
              {/* 日付グリッド */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 1,
                }}
              >
                {/* 月の最初の日の曜日まで空白を追加 */}
                {Array.from({ length: monthDates[0]?.day() || 0 }).map(
                  (_, index) => (
                    <Box key={`empty-${index}`} />
                  )
                )}
                {monthDates.map((date) => {
                  const dateStr = date.format("YYYY-MM-DD");
                  const isSelected = tempSelectedDates.some(
                    (d) => d.format("YYYY-MM-DD") === dateStr
                  );
                  const hasRecord = datesWithRecords.has(dateStr);
                  const isDisabled =
                    !hasRecord ||
                    (!isSelected && tempSelectedDates.length >= 5);
                  const isToday = date.isSame(dayjs(), "day");
                  const isSunday = date.day() === 0;
                  const isSaturday = date.day() === 6;

                  return (
                    <FormControlLabel
                      key={dateStr}
                      control={
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleDateToggle(date)}
                          disabled={isDisabled}
                          size="small"
                        />
                      }
                      label={
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: isToday ? "bold" : "normal",
                            color: isDisabled
                              ? "text.disabled"
                              : isToday
                              ? "primary.main"
                              : isSunday
                              ? "error.main"
                              : isSaturday
                              ? "primary.main"
                              : "inherit",
                          }}
                        >
                          {date.date()}
                        </Typography>
                      }
                      sx={{
                        m: 0,
                        justifyContent: "center",
                        "& .MuiFormControlLabel-label": {
                          ml: 0.5,
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDateDialog}>キャンセル</Button>
              <Button
                onClick={handleDateSelectOk}
                variant="contained"
                disabled={tempSelectedDates.length === 0}
              >
                OK
              </Button>
            </DialogActions>
          </Dialog>

          {/* 日勤/夜勤の分類表示 */}
          {!loading &&
            hasSelectedDates &&
            (dayShiftRecords.length > 0 || nightShiftRecords.length > 0) && (
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  flexDirection: { xs: "column", md: "row" },
                }}
              >
                {/* 日中セクション */}
                <Card sx={{ flex: 1 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6" sx={{ color: "primary.main" }}>
                        日中
                      </Typography>
                      <Box
                        sx={{ display: "flex", gap: 2, alignItems: "center" }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {dayShiftRecords.length}件の記録
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {dayShiftStaffCount}名のスタッフ
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    {dayShiftPercentages.length > 0 ? (
                      <Box>
                        {dayShiftPercentages.map((item) => (
                          <Box
                            key={item.key}
                            sx={{
                              mb: 1,
                              p: 1,
                              bgcolor: "background.default",
                              borderRadius: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    backgroundColor: item.color,
                                    borderRadius: "4px",
                                  }}
                                />
                                <Typography variant="subtitle2">
                                  {item.label}
                                </Typography>
                              </Box>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: "bold" }}
                              >
                                {item.percentage}%
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        データがありません
                      </Typography>
                    )}
                    {dayShiftPercentages.length > 0 && (
                      <Box
                        sx={{
                          mt: 2,
                          pt: 1,
                          borderTop: 1,
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          align="right"
                        >
                          合計計測時間: {dayShiftTotalHours}時間
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* 夜間セクション */}
                <Card sx={{ flex: 1 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6" sx={{ color: "secondary.main" }}>
                        夜間
                      </Typography>
                      <Box
                        sx={{ display: "flex", gap: 2, alignItems: "center" }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {nightShiftRecords.length}件の記録
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {nightShiftStaffCount}名のスタッフ
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    {nightShiftPercentages.length > 0 ? (
                      <Box>
                        {nightShiftPercentages.map((item) => (
                          <Box
                            key={item.key}
                            sx={{
                              mb: 1,
                              p: 1,
                              bgcolor: "background.default",
                              borderRadius: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    backgroundColor: item.color,
                                    borderRadius: "4px",
                                  }}
                                />
                                <Typography variant="subtitle2">
                                  {item.label}
                                </Typography>
                              </Box>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: "bold" }}
                              >
                                {item.percentage}%
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        データがありません
                      </Typography>
                    )}
                    {nightShiftPercentages.length > 0 && (
                      <Box
                        sx={{
                          mt: 2,
                          pt: 1,
                          borderTop: 1,
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          align="right"
                        >
                          合計計測時間: {nightShiftTotalHours}時間
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}

          {!loading && !hasSelectedDates && (
            <Typography variant="body1" color="text.secondary">
              日付を選択してください。
            </Typography>
          )}
          {!loading &&
            hasSelectedDates &&
            dayShiftRecords.length === 0 &&
            nightShiftRecords.length === 0 && (
              <Typography variant="body1" color="text.secondary">
                記録がありません。
              </Typography>
            )}
        </Box>
      </LocalizationProvider>
    </PageSectionLayout>
  );
};

export default CreateReport;
