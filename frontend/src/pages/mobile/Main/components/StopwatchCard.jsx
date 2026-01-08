import StopCircleIcon from "@mui/icons-material/StopCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CardHeader from "@mui/material/CardHeader";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { useState } from "react";

import { formatTime } from "../../../../utils/timeUtils";

const StopwatchCard = ({
  label,
  icon,
  color,
  elapsedTime,
  onClose,
  onStop, // ストップボタンの関数
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleCloseClick = () => {
    setIsConfirmOpen(true);
  };

  const handleCancelClose = () => {
    setIsConfirmOpen(false);
  };

  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
    onClose();
  };
  return (
    <Card
      sx={{
        position: "fixed",
        bottom: 88, // 下からのマージン
        left: 16, // 左からのマージン
        right: 16, // 右からのマージン
        zIndex: 1100, // 他の要素より手前に表示
        boxShadow: 6, // 影を少し濃くする
        borderRadius: 4,
      }}
    >
      {/* カードヘッダー */}
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* アイコン */}
            <Box
              component="span"
              sx={{
                mr: 1,
                display: "flex",
                alignItems: "center",
                "& img": {
                  width: "35px",
                  height: "35px",
                },
                "& svg": {
                  width: "35px",
                  height: "35px",
                },
              }}
            >
              {icon}
            </Box>
            {/* ラベル */}
            <Typography variant="h6">{label}</Typography>
          </Box>
        }
        action={
          <>
            <IconButton
              aria-label="close"
              onClick={handleCloseClick}
              size="small"
            >
              <CloseIcon sx={{ color: "white" }} />
            </IconButton>
            <Dialog open={isConfirmOpen} onClose={handleCancelClose}>
              <DialogTitle>確認</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  現在計測中のタイマーを削除します。よろしいですか？
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCancelClose}>キャンセル</Button>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={handleConfirmClose}
                >
                  削除
                </Button>
              </DialogActions>
            </Dialog>
          </>
        }
        sx={{
          pb: 1,
          pt: 1,
          backgroundColor: color,
          color: "white",
          padding: "10px",
        }} // ヘッダーの上下パディング調整
      />
      {/* カード内容 */}
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* タイマー表示 */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AccessTimeIcon fontSize="large" sx={{ mr: 1 }} />
          <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
            {formatTime(elapsedTime)}
          </Typography>
        </Box>

        {/* ストップボタン */}
        <IconButton
          aria-label="stop"
          onClick={onStop}
          color="primary"
          sx={{ padding: 0 }}
        >
          <StopCircleIcon sx={{ fontSize: "55px" }} />
        </IconButton>
      </CardContent>
    </Card>
  );
};

export default StopwatchCard;
