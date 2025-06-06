import Snackbar from "@mui/material/Snackbar";
// src/components/NotificationSnackbar.tsx
import Alert from "@mui/material/Alert";
import React from "react";

const NotificationSnackbar = ({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 3000, // 表示時間（デフォルト３秒）
  vertical = "top", // 表示位置
  horizontal = "center", // 表示位置
}) => {
  return (
    <Snackbar
      open={open}
      sx={{ width: "60%" }}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical, horizontal }}
    >
      {/* Alert コンポーネントでメッセージを表示 */}
      {/* severity が空文字列の場合などにエラーにならないように条件分岐を追加 */}
      {message && severity ? (
        <Alert
          onClose={onClose}
          severity={severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
};

export default NotificationSnackbar;
