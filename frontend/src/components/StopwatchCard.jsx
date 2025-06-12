import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CardHeader from "@mui/material/CardHeader";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";

import { formatTime } from "../utils/timeUtils";

const StopwatchCard = ({
  label,
  icon,
  color,
  elapsedTime,
  isRunning, // タイマーが実行中かどうかの状態
  onClose,
  onStop, // ストップボタンの関数
  onPause, // 一時停止ボタンの関数
  onResume, // 再生ぼたんの関数
}) => {
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
          <IconButton aria-label="close" onClick={onClose} size="small">
            <CloseIcon sx={{ color: "white" }} />
          </IconButton>
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

        {/* 一時停止・再生ボタン */}
        <Box>
          <IconButton
            aria-label={isRunning ? "pause" : "resume"}
            onClick={isRunning ? onPause : onResume} // 状態に応じてハンドラを切り替え
            color="primary"
            sx={{ padding: 0 }}
          >
            {isRunning ? (
              <PauseCircleIcon fontSize="large" sx={{ fontSize: "55px" }} />
            ) : (
              <PlayCircleIcon fontSize="large" />
            )}
          </IconButton>
          <IconButton
            aria-label="stop"
            onClick={onStop}
            color="primary"
            sx={{ padding: 0 }}
          >
            <StopCircleIcon sx={{ fontSize: "55px" }} />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StopwatchCard;
