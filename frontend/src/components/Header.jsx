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
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import localeData from "dayjs/plugin/localeData";
import { Avatar } from "@mui/material";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";
import ja from "dayjs/locale/ja";
import { useState } from "react";
import * as React from "react";
import dayjs from "dayjs";

dayjs.locale(ja);
dayjs.extend(localeData);

import { performLogout } from "../utils/auth";
import { colors } from "../constants/theme";
import { getValue } from "../utils/localStorageUtils";
import { apiFetch } from "../utils/api";
import { showSnackbar } from "../store/slices/snackbarSlice";
import { startLoading, stopLoading } from "../store/slices/loadingSlice";

// ヘッダーコンポーネント
const Header = () => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { id, userName } = useSelector((state) => state.auth);

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

  const handleClickSave = async () => {
    dispatch(startLoading());
    try {
      const allDailyRecords = getValue(`dailyTimeStudyRecords_${id}`, {});
      const todayKey = new Date().toISOString().split("T")[0];
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
          staff_id: id,
          record_date: todayKey,
          record: todayRecord,
        },
      });
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
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                ログアウト
              </MenuItem>
            </Menu>
          </div>
          <Typography sx={{ flexGrow: 1, textAlign: "start" }}>
            {userName}
          </Typography>

          <Button
            variant="outlined"
            onClick={handleClickSave}
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
    </Box>
  );
};

export default Header;
