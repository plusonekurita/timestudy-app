import {
  Button,
  AppBar,
  Divider,
  Toolbar,
  MenuItem,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Person as PersonIcon,
  Logout as LogoutIcon,
  HelpOutline as HelpIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import localeData from "dayjs/plugin/localeData";
import { Avatar } from "@mui/material";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";
import ja from "dayjs/locale/ja";
import { useState, useEffect } from "react";
import * as React from "react";
import dayjs from "dayjs";

dayjs.locale(ja);
dayjs.extend(localeData);

import { performLogout } from "../utils/auth";
import { getValue, setItem, removeItem } from "../utils/localStorageUtils";
import { apiFetch } from "../utils/api";
import { showSnackbar } from "../store/slices/snackbarSlice";
import { startLoading, stopLoading } from "../store/slices/loadingSlice";
import { useStopwatchContext } from "../constants/StopwatchProvider";
import PDFViewer from "./PDFViewer";

// ヘッダーコンポーネント
const Header = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const { id, userName } = useSelector((state) => state.auth);

  const user = getValue("user");
  const { stopTimer, activeItem, startTimer } = useStopwatchContext(); // タイマーの停止と状態の取得

  // 当日分のローカル記録があるか動的に判定
  const [canFinish, setCanFinish] = useState(false);
  // 当日以外のローカル記録があるか動的に判定（記録同期ボタン用）
  const [canSync, setCanSync] = useState(false);

  useEffect(() => {
    const computeCanFinish = () => {
      const todayKey = new Date().toISOString().split("T")[0];
      const allDailyRecords = getValue(`dailyTimeStudyRecords_${id}`, {});
      const todayRecord = (allDailyRecords && allDailyRecords[todayKey]) || [];
      const next = Array.isArray(todayRecord) && todayRecord.length > 0;
      setCanFinish(next);

      // 当日以外で1件以上記録があるか
      const hasNonToday = Object.entries(allDailyRecords || {}).some(
        ([key, value]) =>
          key !== todayKey && Array.isArray(value) && value.length > 0
      );
      setCanSync(hasNonToday);
    };

    // 初期判定
    computeCanFinish();

    // 同一タブでは storage イベントが発火しないため軽量ポーリング
    const intervalId = setInterval(computeCanFinish, 1000);

    // タブ復帰時にも再判定
    const handleVisibility = () => computeCanFinish();
    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
  }, [id]);

  // メニューを開く
  const handleOpenUserMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // メニューを閉じる
  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  // ログアウト処理
  const handleLogout = () => {
    performLogout(dispatch); // ログアウト
    handleCloseUserMenu(); // メニューを閉じる
  };

  const handleHelpOpen = () => {
    setHelpOpen(true);
    handleCloseUserMenu();
  };

  const handleClickSave = async () => {
    dispatch(startLoading());
    try {
      const todayKey = new Date().toISOString().split("T")[0];
      // 進行中のタイマーがあれば停止してローカル保存してから続行
      if (activeItem && startTimer) {
        stopTimer();
      }
      const allDailyRecords = getValue(`dailyTimeStudyRecords_${id}`, {});
      const todayRecord = allDailyRecords[todayKey] || [];
      if (todayRecord.length === 0) {
        dispatch(
          showSnackbar({
            message: `計測の記録がありません`,
            severity: "error",
          })
        );
        return;
      }
      await apiFetch("/save-time-records", {
        method: "POST",
        body: {
          staff: user,
          record_date: todayKey,
          record: todayRecord,
        },
      });
      // 保存成功時は当日分のDB保存用ローカル記録を削除（表示用は残す）
      const updatedRecords = { ...allDailyRecords };
      delete updatedRecords[todayKey];
      if (Object.keys(updatedRecords).length === 0) {
        removeItem(`dailyTimeStudyRecords_${id}`);
      } else {
        setItem(`dailyTimeStudyRecords_${id}`, updatedRecords);
      }
      // ボタン状態を即時反映
      setCanFinish(false);
      // 同期対象が無くなっていれば更新
      const hasNonTodayAfterSave = Object.keys(updatedRecords).some(
        (k) =>
          k !== todayKey &&
          Array.isArray(updatedRecords[k]) &&
          updatedRecords[k].length > 0
      );
      setCanSync(hasNonTodayAfterSave);
      dispatch(
        showSnackbar({
          message: `記録保存に成功しました。`,
          severity: "success",
        })
      );
      setConfirmOpen(true);
    } catch (error) {
      console.warn(error);
      alert("記録保存に失敗しました。もう一度お試しください。");
    } finally {
      dispatch(stopLoading());
    }
  };

  // 当日以外の記録を同期保存
  const handleClickSync = async () => {
    dispatch(startLoading());
    try {
      const allDailyRecords = getValue(`dailyTimeStudyRecords_${id}`, {});
      const todayKey = new Date().toISOString().split("T")[0];
      const targetDates = Object.keys(allDailyRecords || {}).filter(
        (k) =>
          k !== todayKey &&
          Array.isArray(allDailyRecords[k]) &&
          allDailyRecords[k].length > 0
      );

      if (targetDates.length === 0) {
        dispatch(
          showSnackbar({
            message: `同期対象の記録はありません。`,
            severity: "info",
          })
        );
        return;
      }

      for (const d of targetDates) {
        const rec = allDailyRecords[d];
        await apiFetch("/save-time-records", {
          method: "POST",
          body: {
            staff: user,
            record_date: d,
            record: rec,
          },
        });
      }

      // 同期成功: 対象日のローカル記録を削除
      const updated = { ...allDailyRecords };
      for (const d of targetDates) delete updated[d];
      if (Object.keys(updated).length === 0) {
        removeItem(`dailyTimeStudyRecords_${id}`);
      } else {
        setItem(`dailyTimeStudyRecords_${id}`, updated);
      }

      // 状態更新
      setCanSync(false);

      dispatch(
        showSnackbar({
          message: `過去分の記録を${targetDates.length}日分同期しました。`,
          severity: "success",
        })
      );
    } catch (error) {
      console.warn(error);
      alert("記録同期に失敗しました。もう一度お試しください。");
    } finally {
      dispatch(stopLoading());
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ minHeight: "42px" }}>
          <div>
            <IconButton
              size="small"
              aria-controls={anchorEl ? "account-menu" : undefined}
              aria-expanded={anchorEl ? "true" : undefined}
              aria-haspopup="true"
              onClick={handleOpenUserMenu} // メニューを開く
              color="inherit"
              sx={{ pt: 0, pb: 0 }}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleCloseUserMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  },
                },
              }}
            >
              {/* <MenuItem>勤務終了</MenuItem>
              <Divider /> */}
              <MenuItem onClick={handleClickSync} disabled={!canSync}>
                記録同期
              </MenuItem>
              <MenuItem onClick={handleHelpOpen}>
                <HelpIcon sx={{ mr: 1 }} />
                ヘルプ
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                ログアウト
              </MenuItem>
            </Menu>
          </div>
          <Typography sx={{ flexGrow: 1, textAlign: "start" }}>
            {userName}
          </Typography>

          {location.pathname.startsWith("/time") && (
            <Button
              variant="outlined"
              onClick={handleClickSave}
              disabled={!canFinish}
              sx={{
                textAlign: "end",
                justifyContent: "flex-end",
                borderColor: "white",
                color: "white",
                "&:hover": {
                  color: "darkred",
                  borderColor: "darkred",
                },
              }}
            >
              勤務終了
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>ログアウト確認</DialogTitle>
        <DialogContent>ログアウトしますか？</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>キャンセル</Button>
          <Button
            variant="contained"
            onClick={handleLogout}
            color="primary"
            autoFocus
          >
            ログアウト
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullScreen
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setHelpOpen(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              マニュアル
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            flexGrow: 1,
            height: "100%",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            backgroundColor: "#f5f5f5", // 背景色を薄いグレーに
          }}
        >
          <PDFViewer file="/manual/manual_mobile.pdf" />
        </Box>
      </Dialog>
    </Box >
  );
};

export default Header;
